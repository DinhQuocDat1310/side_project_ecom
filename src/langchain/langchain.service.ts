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
  id: string; // Assuming each document has a unique identifier of type string
  title: string; // Assuming each document has a title of type string
  pageContent: string; // The content of the document, which could be of any type
  metadata: [];
}
const documents: Document<Record<string, any>>[] = [
  {
    id: '1',
    title: 'Document 1',
    pageContent: 'Test data 41.1',
    metadata: [],
  },
  {
    id: '2',
    title: 'Document 2',
    pageContent: 'Test data 47.1',
    metadata: [],
  },
  // Add more documents as needed
];
// process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const client = new MongoClient(process.env.DATABASE_URL);

// model chatgpt
const llm = new OpenAIEmbeddings();

@Injectable()
export class LangchainService {
  retriever: any;

  constructor() {
    // this.retriever = this.getVectoreStore()
  }
  async getVectoreStore() {
    const client = new MongoClient(process.env.DATABASE_URL || '');
    const namespace = 'ecommerce_nest.vector_store_message';
    const [dbName, collectionName] = namespace.split('.');
    const collection = client.db(dbName).collection(collectionName);

    const vectorStore = new MongoDBAtlasVectorSearch(llm, {
      collection,
      indexName: 'vector_index',
      textKey: 'message',
    });
    return vectorStore.asRetriever();
  }
  async query(humanMessage: HumanMessage): Promise<AIMessage> {
    const message = await this.vector_search(humanMessage.message);
    return {
      message: message,
      status: MessageStatus.SEND,
    };
  }
  // async create() {
  //   try {
  //     const database = client.db('ecommerce_nest');
  //     const collection = database.collection('vector_store_message');
  //     const dbConfig = {
  //       collection: collection,
  //       indexName: 'vector_index', // The name of the Atlas search index to use.
  //       textKey: 'message', // Field name for the raw text content. Defaults to "text".
  //       embeddingKey: 'embedding', // Field name for the vector embeddings. Defaults to "embedding".
  //     };

  //     const vectorStore = await MongoDBAtlasVectorSearch.fromDocuments(
  //       documents,
  //       llm,
  //       dbConfig,
  //     );
  //   } finally {
  //     // Ensure that the client will close when you finish/error
  //     await client.close();
  //   }
  // }
  async vector_search(humanMessage: string): Promise<string> {
    try {
      const retriever = await this.getVectoreStore();
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
      await client.close();
    }
  }
}
