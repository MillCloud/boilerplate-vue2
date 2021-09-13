import { getCurrentInstance } from '@vue/composition-api';

export function useRouter() {
  const vm = getCurrentInstance();
  if (!vm) throw new Error('Vue composition-api must be called in setup.');
  return vm.proxy.$router;
}

export function useRoute() {
  const vm = getCurrentInstance();
  if (!vm) throw new Error('Vue composition-api must be called in setup.');
  return vm.proxy.$route;
}

export function useRouteHash() {
  return useRoute().hash;
}

export function useRouteQuery() {
  return useRoute().query;
}
