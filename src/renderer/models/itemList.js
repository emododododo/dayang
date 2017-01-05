import { query } from '../services/list';

export default {

  namespace: 'itemList',

  state: {
    list: [],
    queryName: '',
    isLoadingList: false,
  },
  subscriptions: {
    queryItemLists({ dispatch }) {
      dispatch({
        type: 'query',
        payload: {
          isLoadingList: true,
          queryName: 'dailyZhihu',
          list: [],
        },
      });
    },
  },
  effects: {
    * query({ payload }, { call, put }) {
      const { data } = yield call(query, payload);
      if (data) {
        yield put({
          type: 'querySuccess',
          payload: {
            isLoadingList: false,
            queryName: 'dailyZhihu',
            list: data.data,
          },
        });
      }
    },
  },
  reducers: {
    querySuccess(state, action) {
      return { ...state, ...action.payload };
    },
  },

};