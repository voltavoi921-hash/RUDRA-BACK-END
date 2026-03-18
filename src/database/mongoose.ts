import mongoose, { Connection } from 'mongoose';
import { logger } from '../utils/logger.js';

/**
 * RUDRA.OX MONGOOSE CONNECTION ENGINE
 * Handles MongoDB connection with retry logic, connection pooling, and event handlers
 * Ensures the database layer never becomes a single point of failure
 */

class MongooseEngine {
  private connection: Connection | null = null;
  private reconnectAttempts: number = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 10;
  private readonly RECONNECT_DELAY = 5000; // 5 seconds
  private isShuttingDown: boolean = false;

  /**
   * Initialize and connect to MongoDB
   */
  async connect(): Promise<void> {
    try {
      const mongoUri = process.env.MONGO_URI;
      if (!mongoUri) {
        throw new Error('MONGO_URI is not defined in environment variables');
      }

      logger.info('🔌 Initiating MongoDB Connection...');
      console.log('[MONGOOSE] URI:', mongoUri.split('@')[0] + '@' + '***'); // Log URI without password
      console.log('[MONGOOSE] Connection Options: maxPoolSize=100, minPoolSize=10, timeout=10s');

      // Attach event listeners BEFORE connecting
      this.attachEventListeners();

      await mongoose.connect(mongoUri, {
        maxPoolSize: 100, // Supports up to 100 concurrent db operations
        minPoolSize: 10,  // Maintains minimum 10 connections
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        retryWrites: true,
        retryReads: true,
        family: 4, // Use IPv4
      });

      this.connection = mongoose.connection;
      this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection

      logger.success('✅ RUDRA.OX Connected to MongoDB (God-Tier Database Ready!)');
      console.log('✅ [MONGOOSE] Connection successful to:', mongoose.connection.host);
      return;
    } catch (error) {
      console.error('❌ [MONGOOSE CRITICAL ERROR]', {
        name: (error as any)?.name,
        message: (error as any)?.message,
        code: (error as any)?.code,
        fullError: error,
      });
      logger.error('❌ MongoDB Connection Failed:', error);
      await this.handleReconnection();
    }
  }

  /**
   * Attach listeners to connection events
   */
  private attachEventListeners(): void {
    // Attach to mongoose.connection object which exists before we connect
    mongoose.connection.on('connected', () => {
      console.log('✅ [MONGOOSE EVENT] MongoDB Connected!');
      logger.success('📡 MongoDB Connection: ESTABLISHED');
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ [MONGOOSE EVENT] MongoDB Disconnected!');
      logger.warn('⚠️  MongoDB Connection: DISCONNECTED');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 [MONGOOSE EVENT] MongoDB Reconnected!');
      logger.success('🔄 MongoDB Connection: RECONNECTED');
      this.reconnectAttempts = 0;
    });

    mongoose.connection.on('error', (error: Error) => {
      console.error('❌ [MONGOOSE EVENT] MongoDB Error Event:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      logger.error('🔴 MongoDB Error:', error);
      if (!this.isShuttingDown) {
        this.handleReconnection();
      }
    });

    // Monitor slow queries (> 100ms)
    mongoose.connection.on('slow', (info) => {
      console.warn('🐌 [MONGOOSE EVENT] Slow Query:', info);
      logger.warn(`🐌 Slow Query (${info.millis}ms):`, info.operation);
    });

    // Add open event listener
    mongoose.connection.on('open', () => {
      console.log('🔓 [MONGOOSE EVENT] MongoDB Open Event!');
    });
  }

  /**
   * Handle automatic reconnection with exponential backoff
   */
  private async handleReconnection(): Promise<void> {
    if (this.isShuttingDown) return;

    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      logger.error(
        `❌ Max Reconnection Attempts (${this.MAX_RECONNECT_ATTEMPTS}) Reached. Shutting down gracefully.`
      );
      process.exit(1);
    }

    this.reconnectAttempts++;
    const delayMs = this.RECONNECT_DELAY * Math.pow(1.5, this.reconnectAttempts - 1); // Exponential backoff

    logger.warn(
      `🔄 Attempting Reconnection... (Attempt ${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS}) - Retrying in ${Math.round(delayMs)}ms`
    );

    return new Promise((resolve) => {
      setTimeout(async () => {
        await this.connect();
        resolve();
      }, delayMs);
    });
  }

  /**
   * Gracefully disconnect from MongoDB
   */
  async disconnect(): Promise<void> {
    this.isShuttingDown = true;

    try {
      logger.info('🔌 Disconnecting MongoDB...');
      await mongoose.disconnect();
      logger.success('✅ MongoDB Disconnected Gracefully');
    } catch (error) {
      logger.error('❌ Error Disconnecting MongoDB:', error);
    }
  }

  /**
   * Get the current connection instance
   */
  getConnection(): Connection | null {
    return this.connection;
  }

  /**
   * Check if connected to MongoDB
   */
  isConnected(): boolean {
    return mongoose.connection.readyState === 1; // 1 = connected
  }

  /**
   * Get connection statistics
   */
  getStats(): {
    isConnected: boolean;
    reconnectAttempts: number;
    dbName: string;
  } {
    return {
      isConnected: this.isConnected(),
      reconnectAttempts: this.reconnectAttempts,
      dbName: mongoose.connection.name || 'Unknown',
    };
  }
}

// Singleton instance
const mongooseEngine = new MongooseEngine();

export { mongooseEngine, MongooseEngine };
