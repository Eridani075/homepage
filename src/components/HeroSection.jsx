import React from 'react';

export default function HeroSection({ heroStyle }) {
    const hour = new Date().getHours();
    let greeting = '夜深了，晚安';
    if (hour < 6) greeting = '夜深了，注意休息';
    else if (hour < 9) greeting = '早上好，充满活力的一天';
    else if (hour < 12) greeting = '上午好，工作顺利';
    else if (hour < 14) greeting = '中午好，稍作歇息';
    else if (hour < 18) greeting = '下午好，继续前行';
    else if (hour < 22) greeting = '晚上好，放松一下';

    if (heroStyle === 'minimal') {
        return (
            <div className="hero-section hero-minimal">
                <div className="avatar">E</div>
                <h2 className="hero-title">{greeting}</h2>
                <div className="hero-divider-minimal"></div>
                <p className="hero-subtitle">这里是你的数字花园与个人基础设施网关。所有的应用服务都在安全运行中，随时准备好为你服务。</p>
            </div>
        );
    }

    return (
        <div className="hero-section">
            <div className="hero-card">
                <div className="hero-header">
                    <div className="avatar">E</div>
                    <div className="status-badge">
                        <span className="status-dot"></span>
                        <span className="status-text">System Online</span>
                    </div>
                </div>
                <div className="hero-content">
                    <h2 className="hero-title">{greeting}</h2>
                    <div className="hero-divider"></div>
                    <p className="hero-subtitle">这里是你的数字花园与个人基础设施网关。所有的应用服务都在安全运行中，随时准备好为你服务。</p>
                </div>
            </div>
        </div>
    );
}
