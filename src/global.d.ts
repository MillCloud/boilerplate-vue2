import type { AxiosError, AxiosResponse } from 'axios';

declare global {
  interface IResponseData {
    success: boolean;
    code: string;
    message: string;
    [propName: string]: any;
  }

  interface IResponse extends AxiosResponse<IResponseData> {}

  interface IResponseError extends AxiosError<IResponseData> {}

  type TPageLimit = 10 | 20 | 50 | 100 | 200 | 500;

  type TUser = Partial<{
    id: number;
    role: number;
  }>;

  interface RootState {
    user: TUser;
  }
}

export {};
