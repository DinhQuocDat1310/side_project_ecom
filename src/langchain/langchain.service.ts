import { Injectable, OnModuleDestroy } from '@nestjs/common';
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

  constructor() {
    this.llm = new OpenAIEmbeddings();
    this.connectToDatabase();
  }

  async connectToDatabase() {
    try {
      this.client = new MongoClient(process.env.DATABASE_URL || '');
      await this.client.connect();
      this.getVectoreStore();
    } catch (error) {
      console.error('Error connecting to the database:', error);
      throw error;
    }
  }

  async getVectoreStore() {
    const namespace = 'ecom-app.Message';
    const [dbName, collectionName] = namespace.split('.');
    const collection = this.client.db(dbName).collection(collectionName);

    const vectorStore = new MongoDBAtlasVectorSearch(this.llm, {
      collection,
      indexName: 'vector_store_message',
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

  async create(humanMessage: HumanMessage): Promise<string> {
    try {
      const database = this.client.db('ecom-app');
      const collection = database.collection('Message');
      const dbConfig = {
        collection: collection,
        indexName: 'vector_store_message',
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
      await this.client.close();
    }
  }
}
