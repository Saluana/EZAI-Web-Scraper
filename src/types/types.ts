export interface ErrorMessage {
    status: string;
    message: string;
}

export interface SuccessMessage {
    status: string;
    notes?: string[];
    title?: string;
    text?: string[];
    summary?: string;
}