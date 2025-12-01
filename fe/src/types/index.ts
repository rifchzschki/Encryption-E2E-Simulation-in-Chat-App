export type BaseResponse<T> = {
    status: string
    message: string
    data: T
}

export const NOTIFICATAION_DURATION = 3000 // 3 detik
