export class ApiResponse<T = any> {
    success: boolean;
    object: T | null;
    message?: string | null;
    number: number = 0;

    constructor() {
        this.success = false;
        this.object = null;
        this.message = null;
        this.number = 0;
    }
}