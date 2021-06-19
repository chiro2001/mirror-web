import axios from "axios";
import { Col, Row, Layout, Tag, Table, Spin } from "antd";
import SideCards from "./sideCards/sideCards";
import React, { Component } from "react";
import { ReactComponent as Logo } from "../../../public/favicon.svg";
import "./homePage.css";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined
} from "@ant-design/icons";

const { Content } = Layout;

/**
 * 镜像列表主页组件
 */
export class HomePage extends Component {
  state = {
    // 镜像列表
    mirrorsList: null,
    // 是否已经获取了镜像列表
    loaded: false
  };

  /**
   * 获取镜像列表
   */
  fetch_mirrors_list = () => {
    this.setState({
      fetching_slots: true
    });
    axios({
      url: "/jobs",
      method: "get"
    }).then(response => {
      const mirrorsList = response.data;
      mirrorsList.sort((a, b) => {
        return a.name < b.name ? -1 : 1;
      });
      this.setState({
        mirrorsList: mirrorsList,
        loaded: true
      });
    });
  };

  componentDidMount() {
    // Chiro: 根据to指定跳转到帮助文档
    const search = window.location.hash.split("?");
    if (search.length > 1) {
      const query = search[search.length - 1].split("&");
      for (const q of query) {
        if (q.startsWith("to=")) {
          try {
            // const to = decodeURIComponent(q.slice(3, q.length)) + '?to=' + q.slice(3, q.length);
            const to = "/doc/docHome" + "?to=" + q.slice(3, q.length);
            console.log("Jumping to:", to);
            this.props.history.push(to);
            // localhost:3000/#/home?to=%2Fdoc%2Fctan
          } catch (e) {
            console.error("Unable to jump to location:", q);
          }
        }
      }
    }
    this.fetch_mirrors_list();
  }

  render() {
    return (
      <Content className="home-page-content">
        <Row type="flex" justify="center">
          <Col>
            <Logo className="home-title-logo" />
          </Col>
          <Col>
            <h1 className="home-title-text">
              {process.env.REACT_APP_SITE_TITLE}
            </h1>
          </Col>
        </Row>
        <Row type="flex" justify="center" gutter={40}>
          <Col md={12}>
            <MirrorsList
              mirrorsList={this.state.mirrorsList}
              loaded={this.state.loaded}
            />
          </Col>
          <Col md={6}>
            <SideCards />
          </Col>
        </Row>
      </Content>
    );
  }
}

/**
 * 镜像列表组件
 */
class MirrorsList extends Component {
  render() {
    if (!this.props.loaded) {
      return (
        <div style={{ textAlign: "center", margin: "50px" }}>
          <Spin size="large" />
        </div>
      );
    }

    const columns = [
      {
        title: "镜像名称",
        dataIndex: "name",
        render: text => <a href={"/" + text}>{text}</a>
      },
      {
        title: "同步状态",
        dataIndex: "status",
        render: status => {
          let statusIcon, statusTagColor, statusLable;
          switch (status) {
            case "success":
              statusIcon = <CheckCircleOutlined />;
              statusTagColor = "success";
              statusLable = "Success";
              break;
            case "syncing":
              statusIcon = <SyncOutlined spin />;
              statusTagColor = "processing";
              statusLable = "Syncing";
              break;
            case "failed":
            case "fail":
              statusIcon = <CloseCircleOutlined />;
              statusTagColor = "error";
              statusLable = "Failed";
              break;
            default:
              statusIcon = <ExclamationCircleOutlined />;
              statusTagColor = "warning";
              statusLable = "Unknown";
              break;
          }
          return (
            <Tag icon={statusIcon} color={statusTagColor}>
              {statusLable}
            </Tag>
          );
        }
      },
      {
        title: "Last Update",
        dataIndex: "last_update",
        render: text =>
          text
            .split(" ")
            .slice(0, 2)
            .join(" ")
      }
    ];
    const data = this.props.mirrorsList;
    return (
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        rowKey="name"
      />
    );
  }
}
