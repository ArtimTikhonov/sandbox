// Общие типы для приложения
export interface ServiceStatus {
    name: string;
    status: 'online' | 'offline' | 'checking';
    response?: string;
    lastCheck?: Date;
    responseTime?: number;
}

export interface SystemStats {
    totalServices: number;
    onlineServices: number;
    offlineServices: number;
    uptime: string;
}

export interface ApiResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
}

export interface HealthStatus {
    status: string;
    components: {
        [key: string]: {
            status: string;
            details?: any;
        };
    };
}