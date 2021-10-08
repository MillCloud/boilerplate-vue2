import axios from 'axios';
import { MessageBox, Notification, Message } from 'element-ui';
import { QueryClient, QueryCache, MutationCache } from 'vue-query';
import pkg from '@/../package.json';
import { clearStorage, getToken } from '@/utils/storage';
import router from '@/router';

const reSignInCodes = new Set(['TOKEN_OUTDATED']);

const instance = axios.create({
  baseURL: process.env.VUE_APP_REQUEST_BASE_URL || '',
  timeout: JSON.parse(process.env.VUE_APP_REQUEST_TIMEOUT || '10000') || 10000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json; charset=utf-8',
    'X-Requested-With': 'XMLHttpRequest',
    'X-Version': `${pkg.name}/${pkg.version}`,
  },
});
instance.interceptors.request.use((config) => ({
  ...config,
  headers: {
    ...config.headers,
    token: getToken() || '',
    'X-Token': getToken() || '',
  },
}));

export { instance as axiosInstance };

export const showError = (
  error: IResponseError,
  type: 'alert' | 'notification' | 'message' = 'alert',
) => {
  const content = `错误代码：${error?.code ?? error?.response?.data?.code ?? '无'}，错误信息：${
    error?.message ?? error?.response?.data?.message ?? '无'
  }。`;
  if (type === 'alert') {
    MessageBox.alert(content, {
      title: '错误',
      type: 'error',
    });
    return;
  }
  if (type === 'notification') {
    Notification.error({
      title: '错误',
      message: content,
    });
    return;
  }
  if (type === 'message') {
    Message.error({
      message: content,
    });
  }
};

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      showError(error as IResponseError);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      showError(error as IResponseError);
    },
  }),
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        // console.log('queryKey', queryKey);
        const { data } = await instance.request<IResponseData>({
          method: 'GET',
          url: queryKey[0] as string,
          params: queryKey[1] as Record<string, any>,
        });
        if (!data.success) {
          if (reSignInCodes.has(data.code)) {
            clearStorage();
            showError({
              message: '请重新登录',
            } as IResponseError);
            router.push('/sign-in');
          } else if ((queryKey[1] as Record<string, any>)?.showError ?? true) {
            showError(
              (data as unknown) as IResponseError,
              (queryKey[1] as Record<string, any>)?.showErrorType,
            );
          }
        }
        return data;
      },
      retry: (failureCount, error) => {
        if ((error as IResponseError).response?.status === 404) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      mutationFn: async (variables) => {
        // console.log('variables', variables);
        const { data } = await instance.request<IResponseData>({
          method: 'POST',
          ...(variables as Record<string, any>),
        });
        if (!data.success) {
          if (reSignInCodes.has(data.code)) {
            clearStorage();
            showError({
              message: '请重新登录',
            } as IResponseError);
            router.push('/sign-in');
          } else if ((variables as Record<string, any>)?.showError ?? true) {
            showError(
              (data as unknown) as IResponseError,
              (variables as Record<string, any>)?.showErrorType,
            );
          }
        }
        return data;
      },
      retry: (failureCount, error) => {
        if ((error as IResponseError).response?.status === 404) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});
