import { Injectable } from '@nestjs/common';
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
    this.client = new MongoClient(process.env.DATABASE_URL || '');
    this.llm = new OpenAIEmbeddings();
    this.getVectoreStore();
    
  }
 
  async getVectoreStore() {
    const namespace = 'ecommerce_nest.vector_store_message';
    const [dbName, collectionName] = namespace.split('.');
    const collection = this.client.db(dbName).collection(collectionName);

    const vectorStore = new MongoDBAtlasVectorSearch(this.llm, {
      collection,
      indexName: 'vector_index',
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
  async create(humanMessage: HumanMessage) : Promise<string>{
    try {
      const database = this.client.db('ecommerce_nest');
      const collection = database.collection('vector_store_message');
      const dbConfig = {
        collection: collection,
        indexName: 'vector_index',
        textKey: 'message',
      };
      const documents: Document<Record<string, any>>[] = [
        {
          pageContent: humanMessage.message,
          metadata: {
            source: "Cotchi",
          },
          title: 'Test title'
        },
      ];
      const vectorStore = await MongoDBAtlasVectorSearch.fromDocuments(
        documents,
        this.llm,
        dbConfig,
      );
      return "OK"
    } finally {
      // Ensure that the client will close when you finish/error
      await this.client.close();
    }
  }
  async vector_search(humanMessage: string): Promise<string> {
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
      const answer = await chain.invoke(question);
      console.log('Question: ' + question);
      console.log('Answer: ' + answer);
      return answer;
    } finally {
      await this.client.close();
    }
  }
}
