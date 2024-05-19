import { ForbiddenException, Injectable } from '@nestjs/common';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { MongoClient } from 'mongodb';
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
import { formatDocumentsAsString } from 'langchain/util/document';
import { PromptTemplate } from '@langchain/core/prompts';
import {
  RunnableSequence,
  RunnablePassthrough,
} from '@langchain/core/runnables';
import { AIMessage } from './entities/langchain.entity';
import { MessageStatus } from '@prisma/client';
import { HumanMessage } from './dto/langchain.input';
import { ConfigService } from '@nestjs/config';

import { GoogleGenerativeAI } from '@google/generative-ai';

// mock vectore embedding data
interface Document<T> {
  title: string; // Assuming each document has a title of type string
  pageContent: string; // The content of the document, which could be of any type
  metadata: {};
}

@Injectable()
export class LangchainService {
  retriever: any;
  client: MongoClient;
  llm: OpenAIEmbeddings;
  genAI: GoogleGenerativeAI;
  constructor(
    private readonly configService: ConfigService, // private readonly prismaService: PrismaService, // private readonly userService: UserService,
  ) {
    this.llm = new OpenAIEmbeddings();
    this.connectToDatabase();
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  }
  async connectToDatabase() {
    try {
      this.client = new MongoClient(
        this.configService.get('DATABASE_URL') || '',
      );
      await this.client.connect();
      this.getVectoreStore();
    } catch (error) {
      console.error('Error connecting to the database:', error);
      throw error;
    }
  }

  async getVectoreStore() {
    const namespace = this.configService.get('NAMESPACE_VECTOR');
    const [dbName, collectionName] = namespace.split('.');
    const collection = this.client.db(dbName).collection(collectionName);

    const vectorStore = new MongoDBAtlasVectorSearch(this.llm, {
      collection,
      indexName: this.configService.get('INDEXES_VECTOR_NAME'),
      textKey: 'message',
    });
    this.retriever = vectorStore.asRetriever();
  }

  async query(humanMessage: HumanMessage): Promise<AIMessage> {
    const message = await this.vector_search(humanMessage.message);
    return {
      message: message,
      status: MessageStatus.SEND,
    };
  }
  async queryGemini(humanMessage: HumanMessage): Promise<AIMessage> {
    const message = await this.vector_search_gemini_model(humanMessage.message);
    return {
      message: message,
      status: MessageStatus.SEND,
    };
  }
  async create(humanMessage: HumanMessage): Promise<string> {
    try {
      const database = this.client.db(
        this.configService.get('DATABASE_VECTOR_NAME'),
      );
      const collection = database.collection(
        this.configService.get('COLLECTION_VECTOR_NAME'),
      );
      const dbConfig = {
        collection: collection,
        indexName: this.configService.get('INDEXES_VECTOR_NAME'),
        textKey: 'message',
      };
      const documents: Document<Record<string, any>>[] = [
        {
          pageContent: humanMessage.message,
          metadata: {
            source: 'Cotchi',
          },
          title: 'Test title',
        },
      ];
      await MongoDBAtlasVectorSearch.fromDocuments(
        documents,
        this.llm,
        dbConfig,
      );
      return 'OK';
    } finally {
      // Ensure that the client will close when you finish/error
      await this.client.close();
    }
  }

  async vector_search(humanMessage: string): Promise<any> {
    try {
      const retriever = this.retriever;
      const prompt =
        PromptTemplate.fromTemplate(`Answer the question based on the following context:
      {context}
      Question: {question}`);
      const model = new ChatOpenAI();
      const chain = RunnableSequence.from([
        {
          context: retriever.pipe(formatDocumentsAsString),
          question: new RunnablePassthrough(),
        },
        prompt,
        model,
        new StringOutputParser(),
      ]);
      const question = humanMessage;
      return await chain.invoke(question);
    } catch (error) {
      console.log(147);
      await this.client.close();
      throw new ForbiddenException(
        'Something wrong with the OpenAI key, please try again.',
      );
    } finally {
      return await this.vector_search_gemini_model(humanMessage);
    }
  }
  async vector_search_gemini_model(humanMessage: string): Promise<any> {
    try {
      // const retriever = this.retriever;

      // Update user message history with the new message
      // const newUserMessagse = {
      //   role: 'user',
      //   parts: [{ text: humanMessage }],
      // };

      // Assuming user.message is an array
      // user.message.push(newUserMessage);

      // await this.prismaService.user.update({
      //   data: {
      //     message: user.message,
      //   },
      //   where: {
      //     email: user.email,
      //   },
      // });
      console.log(humanMessage);
      const history = [];
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      // Initialize chat with existing history
      const chat = model.startChat({
        history: history,
        generationConfig: {
          maxOutputTokens: 500,
        },
      });

      // Send the new human message
      const result = await chat.sendMessage(humanMessage);
      console.log("🚀 ~ LangchainService ~ vector_search_gemini_model ~ result:", result)
      const response = result.response;
      console.log("🚀 ~ LangchainService ~ vector_search_gemini_model ~ response:", response)
      const modelResponse = response.text();

      // Update the message history with the model's response
      // const newModelMessage = {
      //   role: 'model',
      //   parts: [{ text: modelResponse }],
      // };

      // user.message.push(newModelMessage);

      // await this.prismaService.user.update({
      //   data: {
      //     message: user.message,
      //   },
      //   where: {
      //     email: user.email,
      //   },
      // });
      console.log('modelResponse', modelResponse);

      return modelResponse;
    } catch (error) {
      await this.client.close();
      throw new ForbiddenException(
        'Something went wrong with the OpenAI key, please try again.',
      );
    }
  }
}
