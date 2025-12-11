export interface Document {
    id: number;
    filename: string;
    filepath: string;
    filesize: number;
    created_at: string;
}

export interface Notification {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
}
