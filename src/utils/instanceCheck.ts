import { SuccessMessage, ErrorMessage } from '../types/types'

function instanceOfSuccess(data: any): data is SuccessMessage {
    return 'status' in data;
}

function instanceOfError(data: any): data is ErrorMessage {
    return 'message' in data;
}

export { instanceOfSuccess, instanceOfError }