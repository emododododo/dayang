import { query } from '../services/list';
import { getStorage, setStorage } from '../utils/localStorage';

const ipcRenderer = require('electron').ipcRenderer;

let navList = [{
  title: '知乎日报-每日',
  id: 'dailyZhihu',
},
{
  title: '博客园',
  id: 'cnblogs',
}, {
  title: 'csdn',
  id: 'csdn',
}, {
  title: '湾区',
  id: 'wanqu',
}, {
  title: 'IT之家',
  id: 'ithome',
}, {
  title: 'solidot奇客',
  id: 'solidot',
}];

let allNavList = [{
  title: '知乎日报-每日',
  id: 'dailyZhihu',
},
{
  title: '博客园',
  id: 'cnblogs',
}, {
  title: 'csdn',
  id: 'csdn',
}, {
  title: '湾区',
  id: 'wanqu',
}, {
  title: 'IT之家',
  id: 'ithome',
}, {
  title: 'solidot奇客',
  id: 'solidot',
}];

// Read selectedNavList for localStorage
if (getStorage('selectedNavList') && getStorage('selectedNavList').length > 0) {
  navList = getStorage('selectedNavList');
} else {
  setStorage('selectedNavList', navList);
}

// Read allNavList for localStorage
if (getStorage('allNavList') && getStorage('allNavList').length > 0) {
  allNavList = getStorage('allNavList');
}

export default {

  namespace: 'itemList',

  state: {
    list: [],
    queryName: '',
    isLoadingList: false,
    navList,
    allNavList,
  },
  subscriptions: {
    queryItemLists({ dispatch }) {
      dispatch({
        type: 'query',
        payload: {
          isLoadingList: true,
          queryName: navList[0].id,
          list: [],
        },
      });
    },
    getListHandler({ dispatch }) {
      if (!getStorage('allNavList')) {
        dispatch({
          type: 'updateAllNavList',
          payload: {
            queryName: 'getList',
          },
        });
      }
    },
  },
  effects: {
    query: [function* handler({ payload }, { call, put }) {
      yield put({ type: 'showLoading' });
      const { data } = yield call(query, payload);
      if (data) {
        let list = [];
        let url = '#';
        if (data.data && data.data.length > 0) {
          list = data.data;
          url = data.data[0].url;
        }
        yield put({
          type: 'querySuccess',
          payload: {
            isLoadingList: false,
            queryName: 'dailyZhihu',
            list,
            url,
          },
        });
      }
    }, { type: 'takeLatest' }],
    updateAllNavList: [function* handler({ payload }, { call, put }) {
      const { data } = yield call(query, payload);
      if (data) {
        yield put({
          type: 'updateAllNavListSuccess',
          payload: {
            allNavList: data.list,
          },
        });
      }
    }, { type: 'takeLatest' }],
  },
  reducers: {
    showLoading(state) {
      return { ...state, isLoadingList: true };
    },
    querySuccess(state, action) {
      return { ...state, ...action.payload };
    },
    viewContent(state, action) {
      return { ...state, ...action.payload };
    },
    updateNavList(state, action) {
      // 同步刷新主窗口事件。
      setStorage('selectedNavList', action.payload.navList);
      ipcRenderer.sendSync('sync-EditPage');
      return { ...state, ...action.payload };
    },
    updateAllNavListSuccess(state, action) {
      // 剔除选中列表中不存在的nav
      const allNavListObj = action.payload.allNavList.reduce((obj, item) => {
        const result = obj;

        if (item.data && item.data.length > 0) {
          const dataObj = item.data.reduce((objI, itemI) => {
            const resultI = objI;
            resultI[itemI.id] = itemI.id;
            return resultI;
          });
          return Object.assign({}, result, dataObj);
        }

        result[item.id] = item.id;
        return result;
      }, {});

      const newNavList = navList.reduce((arr, item) => {
        const result = arr;
        if (allNavListObj[item.id]) {
          result.push(item);
        }
        return result;
      }, []);
      setStorage('selectedNavList', newNavList);

      setStorage('allNavList', action.payload.allNavList);
      return { ...state, ...Object.assign({}, state, { allNavList: action.payload.allNavList }) };
    },
  },
};
