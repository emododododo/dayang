import React from 'react';
import { Checkbox, CheckboxGroup } from 'react-checkbox-group';
import styles from './checkBox.css';

const dialog = require('electron').remote.dialog;

class CheckBox extends React.Component {
  constructor(props) {
    super(props);
    const slectedIdList = props.navList.map(item => item.id);
    this.state = {
      slectedIdList,
    };
  }

  onConfirm() {
    // 限制订阅数量
    if (this.state.slectedIdList.length <= 0 || this.state.slectedIdList.length > 10) {
      dialog.showErrorBox('❌', `您只能订阅 1~10 个信息源，请重新选择。但您选择了${this.state.slectedIdList.length}个信息源`);
    }

    const objList = {};
    this.state.slectedIdList.forEach((item) => {
      objList[item] = item;
    });

    // 处理选中数据
    const updateList = this.props.allNavList.reduce((arr, item) => {
      let result = arr;
      if (item.data && item.data.length > 0) {
        const resultJ = item.data.reduce((arrI, itemI) => {
          const resultI = arrI;
          if (objList[itemI.id]) {
            resultI.push({
              id: itemI.id,
              title: itemI.title,
            });
          }
          return resultI;
        }, []);
        result = result.concat(resultJ);
      } else if (objList[item.id]) {
        result.push({
          id: item.id,
          title: item.title,
        });
      }
      return result;
    }, []);

    // Dispatch updateNavList action
    this.props.dispatch({
      type: 'itemList/updateNavList',
      payload: {
        navList: updateList,
      },
    });
  }

  navListChanged(newIdList) {
    this.setState({
      slectedIdList: newIdList,
    });
  }

  render() {
    const allNavList = this.props.allNavList;
    return (
      <div className={`${styles.wrapper}`}>
        <CheckboxGroup name="navList" value={this.state.slectedIdList} onChange={this.navListChanged.bind(this)}>
          {
            allNavList.map((item, index) => {
              if (item.data && item.data.length > 0) {
                return (
                  <div className={styles.wrapper} key={index}>
                    <div className={styles.title}>{item.title}: </div>
                    <div className={styles.itemList}>
                      {
                        item.data.map((itemI, indexI) => {
                          return (
                            <div key={indexI}>
                              <Checkbox value={itemI.id} />
                              <span>{itemI.title}</span>
                            </div>
                          );
                        })
                      }
                    </div>
                  </div>
                );
              }
              return (
                <div className={styles.wrapper} key={index}>
                  <Checkbox value={item.id} />
                  <span>{item.title}</span>
                </div>
              );
            })
          }
        </CheckboxGroup>
        <button onClick={this.onConfirm.bind(this)}>confirm</button>
        <button onClick={this.onConfirm.bind(this)}>close</button>
      </div>
    );
  }
}

export default CheckBox;
