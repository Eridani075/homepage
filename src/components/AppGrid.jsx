import React, { useEffect, useState } from 'react';
import { Server, Globe, Box, Settings, Database } from 'lucide-react';

export default function AppGrid() {
    const apps = [
        { title: '个人博客', desc: '数字花园、笔记、技术教程与开发日志库。', icon: <Globe size={32} /> },
        { title: '路由器控制台', desc: 'OpenWrt 智能家庭网关与网络流量管控面板。', icon: <Server size={32} /> },
        { title: 'FRP 内网穿透', desc: '外部公网访问本地开发环境与服务的隧道管理。', icon: <Box size={32} /> },
        { title: '监控中心 (Grafana)', desc: '探针看板、Docker 容器监控及服务器性能数据。', icon: <Settings size={32} /> },
        { title: '私人云盘', desc: 'Nextcloud 数据中心、跨设备文件同步与照片备份。', icon: <Database size={32} /> },
    ];

    return (
        <div className="grid">
            {apps.map((app, index) => (
                <a href="#" className="card" style={{ animationDelay: `${100 + index * 80}ms` }} key={index}>
                    <div className="icon-wrapper">
                        {app.icon}
                    </div>
                    <h2>{app.title}</h2>
                    <p>{app.desc}</p>
                </a>
            ))}
        </div>
    );
}
