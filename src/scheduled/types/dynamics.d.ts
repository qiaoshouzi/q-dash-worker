// 富文本节点列表
export type RichTextNodes = {
  orig_text: string; // 原始文本
  text: string; // 替换后的文本
  type: string; // 节点类型 https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/dynamic/dynamic_enum.md#%E5%AF%8C%E6%96%87%E6%9C%AC%E8%8A%82%E7%82%B9%E7%B1%BB%E5%9E%8B
  emoji: {
    icon_url: string; // 表情图片URL
    size: number; // 表情尺寸 1 2
    text: string; // 表情的文字代码
    type: number; // 表情类型 1 2 3
  }; // 表情信息
  jump_url: string; // 跳转链接
  rid: string; // 关联ID
  goods: {
    jump_url: string; // 跳转链接
    type: number; // 1
  };
  icon_name: string; // 图标名称 taobao
}[];

export type DynamicItem = {
  basic: {
    comment_id_str: string;
    comment_type: number;
    like_icon: {
      action_url: string;
      end_url: string;
      id: number;
      start_url: string;
    };
    rid_str: string;
  };
  id_str: string; // 动态ID
  modules: {
    module_author: {
      face: string; // 头像
      face_nft: boolean // 是否为NFT头像
      nft_info: {
        region_icon: string; // NFT头像角标
        region_type: number; // NFT头像角标类型
        show_status: number;
      }; // NFT头像信息
      following: boolean | null; // 是否关注此UP主 自已动态为null
      jump_url: string; // 跳转链接
      label: string; // 名称前标签
      mid: number; // UID / SSID
      name: string; // UP主昵称/剧集名称/合集名称
      official_verify: {
        desc: string; // 认证说明
        type: number; // 认证类型
      }; // UP主认证信息
      pendant: {
        expire: number; // 头像框过期时间戳
        image: string; // 头像框图片url
        image_enhance: string; // 头像框图片url
        image_enhance_frame: string; // 头像框图片逐帧序列url
        name: string; // 头像框名称
        pid: number; // 头像框ID
      }; // UP主头像框
      pub_action: string; // 更新动作描述
      pub_location_text: string;
      pub_time: string; // 更新时间 ex. X分钟前
      pub_ts: number; // 更新时间戳 单位秒
      type: // 作者类型
        "AUTHOR_TYPE_NONE" |
        "AUTHOR_TYPE_NORMAL" | // 普通更新
        "AUTHOR_TYPE_PGC" | // 剧集更新
        "AUTHOR_TYPE_UGC_SEASON"; // 合集更新
      vip: {
        avatar_subscript: 0 | 1; // 是否显示角标 0 不显示 1 显示
        avatar_subscript_url: string;
        due_data: number; // 大会员过期时间戳 单位秒
        label: {
          bg_color: string; // 会员标签背景颜色
          bg_style: 0 | 1;
          border_color: string;
          img_label_uri_hans: string; // 大会员牌子图片 动态版 简体版
          img_label_uri_hans_static: string; // 大会员牌子图片 静态版 简体版
          img_label_uri_hant: string; // 大会员牌子图片 动态版 繁体版
          img_label_uri_hant_static: string; // 大会员牌子图片 静态版 繁体版
          label_theme: // 会员标签
            "vip" | // 大会员
            "annual_vip" | // 年度大会员
            "ten_annual_vip" | // 十年大会员
            "hundred_annual_vip" | // 百年大会员
            "fools_day_hundred_annual_vip"; // 最强绿鲤鱼
          path: string;
          text: "大会员" | "年度大会员" | "十年大会员" | "百年大会员" | "最想绿鲤鱼"
          text_color: string; // 用户名文字颜色
          use_img_label: boolean;
        }; // 大会员标签
        nickname_color: string; // 名字显示颜色
        status: 0 | 1 | 2; // 大会员状态 0 无 1 有 2 ?
        theme_type: number; // 0
        type: 0 | 1 | 2; // 大会员类型 0 无 1 月度 2 年度
      }; // UP主大会员信息
      decorate: {
        card_url: string; // 动态卡片小图标URL
        fan: {
          color: string; // 编号颜色
          is_fan: boolean; // 是否是粉丝装扮
          num_str: string; // 装扮编号
          number: number; // 装扮编号
        }; // 粉丝装扮信息
        id: number; // 装扮ID
        jump_url: string; // 跳转URL
        name: string; // 装扮名称
        type: number;
      }; // 装饰信息
    }; // UP主信息
    module_dynamic: {
      additional: {
        common: {
          button: {
            jump_style: {
              icon_url: string;
              text: string; // 按钮显示文案 game: 进入 decoration: 去看看
            }; // 跳转类型 game and decoration 类型特有
            jump_url: string; // 跳转链接
            type: number; // 1: game and decoration | 2: ogv
            check: {
              icon_url: string; // 按钮图片url
              text: string; // 按钮显示文案 ogv: 已追剧
            }; // ogv 类型特有
            status: number; // 1
            uncheck: {
              icon_url: string; // 按钮图片url
              text: string; // 按钮显示文案 ogv: 追剧
            }; // ogv 类型特有
          }; // 按钮内容
          cover: string; // 左侧封面图
          desc1: string; // 描述1
          decs2: string; // 描述2
          head_text: string; // 卡片头文本
          id_str: string; // 相关ID
          jump_url: string; // 跳转链接
          style: number;
          sub_type: string; // 子类型
          title: string; // 卡片标题
        }; // 一般类型 ADDITIONAL_TYPE_COMMON 类型独有
        type: string; // 卡片类型
        reserve: {
          button: {
            check: {
              icon_url: string;
              text: string; // 按钮显示文案 已预约
            }; // 已预约状态显示内容
            status: number; // 预约状态 1: 未预约，使用uncheck 2: 已预约使用check
            type: number; // 类型 1: 视频预约,使用jump_style 2: 直播预约,使用 check 和 uncheck
            uncheck: {
              icon_url: string; // 显示图标URL
              text: string; // 按钮显示文案
              toast: string; // 预约成功显示提示文案
              disable: number; // 是否不可预约 1: 是
            }; // 未预约状态显示内容
            jump_style: {
              icon_url: string;
              text: string; // 按钮显示文案 去观看
            }; // 跳转按钮
            jump_url: string; // 跳转URL
          }; // 按钮信息
          desc1: {
            style: number; // 类型 0: 视频预约 1: 直播中
            text: string; // 显示文案
          }; // 预约时间
          desc2: {
            style: number; // 0
            text: string; // 显示文案
            visible: boolean; // 是否显示 true: 显示文案 false: 显示已结束
          }; // 预约观看量
          jump_url: string; // 跳转URL
          reserve_total: number; // 预约人数
          rid: number;
          state: number; // 0
          stype: number; // 1 2
          title: string; // 预约标题
          up_mid: number; // 预约发起人UID
          desc3: {
            jump_url: string; // 开奖信息跳转URL
            style: number; // 1
            text: string; // 奖品信息显示文案
          }; // 预约有奖信息
        }; // 预约信息 ADDITIONAL_TYPE_RESERVE 类型独有
        goods: {
          head_icon: string;
          head_text: string; // 卡片头显示文案
          items: {
            brief: string; // 商品副标题
            cover: string; // 商品封面
            id: string; // 商品ID
            jump_desc: string; // 跳转按钮显示文案
            jump_url: string; // 跳转链接
            name: string; // 商品名称
            price: string; // 商品价格
          }[]; // 商品信息列表
          jump_url: string;
        }; // 商品内容 ADDITIONAL_TYPE_GOODS 类型独有
        vote: {
          choice_cnt: number; // 1
          default_share: number; // 是否默认勾选同时分享至动态 1: 勾选
          desc: string; // 投票标题
          end_time: number; // 剩余时间 单位秒
          join_cnt: number; // 参与人数
          status: number; // 1
          type: null;
          uid: number; // 投票发起人UID
          vote_id: number; // 投票ID
        }; // 投票信息 ADDITIONAL_TYPE_VOTE 类型独有
        ugc: {
          cover: string; // 封面
          desc_second: string; // 播放量与弹幕数
          duration: string; // 视频长度
          head_text: string;
          id_str: string; // 视频AV号
          jump_url: string; // 跳转链接
          multi_line: boolean; // true
          title: string; // 视频标题
        }; // 视频信息 ADDITIONAL_TYPE_UGC 类型独有
      }; // 相关内容卡片信息
      desc: {
        rich_text_nodes: RichTextNodes; // 富文本节点列表
        text: string; // 动态的文字内容
      }; // 动态文字内容
      major: {
        type: string; // 动态主体类型 https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/dynamic/dynamic_enum.md#%E5%8A%A8%E6%80%81%E4%B8%BB%E4%BD%93%E7%B1%BB%E5%9E%8B
        ugc_season: {
          aid: number; // 视频AV号
          badge: {
            bg_color: string; // 背景颜色
            color: string; // 字体颜色
            text: string; // 角标文案
          }; // 角标信息
          cover: string; // 视频封面
          desc: string; // 视频简介
          disable_preview: number; // 0
          duration_text: string; // 时长
          jump_url: string; // 跳转链接
          stat: {
            danmaku: string; // 弹幕数
            play: string; // 播放量
          }; // 统计信息
          title: string; // 视频标题
        }; // 合集信息 MAJOR_TYPE_UGC_SEASON
        article: {
          covers: {}[]; // 封面图数组
          desc: string; // 文章摘要
          id: number; // 文章cv号
          jump_url: string; // 文章跳转链接
          label: string; // 文章阅读量
          title: string; // 文章标题
        }; // 专栏信息 MAJOR_TYPE_ARTICLE
        draw: {
          id: number; // 对应相薄ID
          items: {
            height: number; // 图片高度
            width: number; // 图片宽度
            size: number; // 图片大小 单位KB
            src: string; // 图片URL
            tags: unknown[]; // TODO:
          }[]; // 图片信息列表
        }; // 带图动态 MAJOR_TYPE_DRAW
        archive: {
          aid: string; // 视频AV号
          badge: {
            bg_color: string; // 背景颜色
            color: string; // 字体颜色
            text: string; // 角标文案
          }; // 角标信息
          bvid: string; // 视频BVID
          cover: string; // 视频封面
          desc: string; // 视频简介
          disable_preview: number; // 0
          duration_text: string; // 视频长度
          jump_url: string; // 跳转URL
          stat: {
            danmaku: string; // 弹幕数
            play: string; // 播放量
          }; // 统计信息
          title: string; // 视频封面
          type: number; // 1
        }; // 视频信息 MAJOR_TYPE_ARCHIVE
        live_rcmd: {
          content: string; // 直播间内容JSON
          reserve_type: number; // 0
        }; // 直播状态 MAJOR_TYPE_LIVE_RCMD
        common: {
          badge: {
            bg_color: string;
            color: string;
            text: string;
          }; // 角标信息
          biz_type: number; // 0
          cover: string; // 左侧图片封面
          desc: string; // 右侧描述信息
          id: string;
          jump_url: string; // 跳转链接
          label: string;
          sketch_id: string;
          style: number; // 1
          title: string; // 右侧标题
        }; // 一般类型 MAJOR_TYPE_COMMON
        pgc: {
          badge: {
            bg_color: string; // 背景颜色
            color: string; // 字体颜色
            text: string; // 角标文案
          }; // 角标信息
          cover: string; // 视频封面
          epid: number; // 分集EPID
          jump_url: string; // 跳转链接
          season_id: number; // 剧集ssid
          stat: {
            danmaku: string; // 弹幕数
            play: string; // 播放量
          }; // 统计信息
          sub_type: number; // 剧集类型 1 番剧 2 电影 3 纪录片 4 国创 5 电视剧 6 漫画 7 综艺
          title: string; // 视频标题
          type: number; // 2
        }; // 剧集信息 MAJOR_TYPE_PGC
        courses: {
          badge: {
            bg_color: string; // 背景颜色
            color: string; // 字体颜色
            text: string; // 角标文案
          }; // 角标信息
          cover: string; // 视频封面URL
          desc: string; // 更新状态描述
          id: number; // 课程ID
          jump_url: string; // 跳转链接
          sub_title: string; // 课程副标题
          title: string; // 课程标题
        }; // 课程信息 MAJOR_TYPE_COURSES
        music: {
          cover: string; // 音频封面
          id: number; // 音频AUID
          jump_url: string; // 跳转链接
          label: string; // 音频分类
          title: string; // 音频标题
        }; // 音频信息 MAJOR_TYPE_MUSIC
        live: {
          badge: {
            bg_color: string; // 背景颜色
            color: string; // 字体颜色
            text: string; // 角标文案
          }; // 角标信息
          cover: string; // 直播封面
          desc_first: string; // 直播主分区名称
          desc_second: string; // 观看人数
          id: number; // 直播间id
          jump_url: string; // 跳转链接
          live_state: number; // 直播状态 0: 结束 1: 正在直播
          reserve_type: number; // 0
          title: string; // 直播间标题
        };
        opus: {
          jump_url: string; // 跳转链接
          pics: {
            height: number;
            width: number;
            size: number;
            url: string;
          }[]; // 图片列表
          summary: {
            rich_text_nodes: RichTextNodes; // 富文本节点
            text: string; // 文本
          };
          title: string; // 标题
        }; // 文章 MAJOR_TYPE_OPUS
        medialist: {
          badge: {
            bg_color: string; // 背景颜色
            color: string; // 字体颜色
            text: string; // 角标文案
          };
          cover: string; // 封面
          cover_type: number; // 2
          id: number;
          jump_url: string; // 跳转链接
          sub_title: string;
          title: string;
        }; // 收藏夹分享
        none: {
          tips: string; // 动态失效显示文案
        }; // 动态失效 MAJOR_TYPE_NONE
      }; // 动态主题对象
      topic: {
        id: number; // 话题ID
        jump_url: string; // 跳转URL
        name: string; // 话题名称
      }; // 话题信息
    }; // 动态内容信息
    module_more: {
      three_point_items: {
        label: string; // 显示文本
        type: string; // 类型
        modal: {
          cancel: string; // 取消按钮 ex.我点错了
          confirm: string; // 确认按钮 ex.删除
          content: string; // 提示内容 ex.确定删除这条动态吗？
          title: string; // 标题 ex.删除动态
        }; // 弹出框信息 删除动态是弹出
        params: {
          dynamic_id: string; // 当前动态ID
          status: boolean; // 当前动态是否处于置顶状态
        }; // 参数 置顶/取消置顶时使用
      }[]; // 右上角三点菜单
    }; // 动态右上角三点菜单
    module_stat: {
      comment: {
        count: number; // 评论数
        forbidden: boolean; // false
        hidden: boolean; // 是否隐藏 直播类型动态会隐藏回复功能
      }; // 评论数据
      forward: {
        count: number; // 转发数
        forbidden: boolean; // false
      }; // 转发数据
      like: {
        count: number; // 点赞数
        forbidden: boolean; // false
        status: boolean; // 当前用户是否点赞
      }; // 点赞数据
    }; // 动态统计数据
    module_interaction: {
      items: {
        desc: {
          rich_text: {
            orig_text: string; // 原始文本
            rid: number; // 关联ID
            text: string; // 替换后的文本
            type: string; // 富文本节点类型 https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/dynamic/dynamic_enum.md#%E5%AF%8C%E6%96%87%E6%9C%AC%E8%8A%82%E7%82%B9%E7%B1%BB%E5%9E%8B
            emoji: {
              icon_url: string; // 表情图片URL
              size: number; // 表情尺寸 1 2
              text: string; // 表情的文字代码
              type: number; // 表情类型 1 2 3
            }; // 表情信息
          }[]; // 富文本节点列表
          text: string; // 评论内容
        }; // 点赞/评论信息
        type: number; // 0 点赞信息 1 评论信息
      }[]; // 信息列表
    }; // 热度评论
    module_fold: {
      ids: {}[]; // 贝折叠的动态ID列表
      statement: string; // 显示文案 ex.展开x条相关动态
      type: number; // 1
      users: unknown[];
    }; // 动态折叠信息
    module_dispute: {
      desc: string;
      jump_url: string;
      title: string; // 提醒文案
    }; // 争议小黄条
  }; // 动态信息
  type: string; // 动态类型
  visible: boolean; // 是否可见
  orig: DynamicItem | string | undefined; // 原始动态信息 仅转发动态存在 DYNAMIC_TYPE_FORWARD
};

export type DynamicItems = DynamicItem[];

export type DynamicsData = {
  has_more: boolean;
  offset: string;
  update_baseline: string;
  update_num: number;
  items: DynamicItems;
};

export type DynamicsAPIResponse = {
  code: number;
  message: string;
  ttl: number;
  data: DynamicsData;
};
