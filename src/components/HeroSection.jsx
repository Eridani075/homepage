import React, { useState, useEffect } from 'react';
import { socialIconMap } from '../socialIconMap';
import AvatarCropModal from './AvatarCropModal';
import { User } from 'lucide-react';

export default function HeroSection({ 
    heroStyle, 
    socialLinks = [], 
    isEditMode, 
    avatarUrl, 
    onAvatarUpload, 
    onResetAvatar, 
    onOpenSocialSettings,
    username,
    setUsername,
    personalSign,
    setPersonalSign,
    cardBlur
}) {
    const hour = new Date().getHours();
    const fileInputRef = React.useRef(null);
    const [cropImageSrc, setCropImageSrc] = useState(null);

    // Revoke cropImageSrc object URL when it changes or unmounts to prevent memory leaks
    useEffect(() => {
        return () => {
            if (cropImageSrc) {
                URL.revokeObjectURL(cropImageSrc);
            }
        };
    }, [cropImageSrc]);

    let greeting = '夜深了，晚安';
    if (hour < 6) greeting = '夜深了，注意休息';
    else if (hour < 9) greeting = '早上好，充满活力的一天';
    else if (hour < 12) greeting = '上午好，工作顺利';
    else if (hour < 14) greeting = '中午好，稍作歇息';
    else if (hour < 18) greeting = '下午好，继续前行';
    else if (hour < 22) greeting = '晚上好，放松一下';

    const renderSocialLinks = () => {
        if (!socialLinks || socialLinks.length === 0) return null;
        return (
            <div className="social-links-container">
                {socialLinks.map(link => {
                    const IconComponent = socialIconMap[link.icon] || socialIconMap['LinkIcon'];
                    return (
                        <a 
                            key={link.id}
                            href={link.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="social-link" 
                            title={link.title}
                        >
                            <IconComponent size={20} />
                        </a>
                    );
                })}
                {isEditMode && (
                    <button 
                        className="social-link add-social-btn" 
                        onClick={onOpenSocialSettings} 
                        title="添加/编辑社交链接"
                        style={{ background: 'transparent', border: '1px dashed var(--outline)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-variant)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    </button>
                )}
            </div>
        );
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setCropImageSrc(url);
        }
        // reset value so the same file can be selected again
        e.target.value = '';
    };

    const handleCropComplete = (blob) => {
        if (onAvatarUpload) {
            // Need to convert blob to File object to match original signature (though blob works with URL.createObjectURL too)
            const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
            onAvatarUpload(file);
        }
        setCropImageSrc(null);
    };

    const renderAvatar = () => {
        const avatarContent = avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="avatar-image" />
        ) : (
            <User size={36} style={{ opacity: 0.85 }} />
        );

        return (
            <div className={`avatar ${isEditMode ? 'avatar-edit-mode' : ''}`}>
                {avatarContent}
                
                {isEditMode && (
                    <div className="avatar-upload-overlay" onClick={() => fileInputRef.current?.click()} title="上传头像图片">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            style={{ display: 'none' }} 
                            accept="image/*" 
                            onChange={handleFileChange} 
                        />
                    </div>
                )}
                
                {isEditMode && avatarUrl && (
                    <button className="avatar-remove-btn" onClick={(e) => { e.stopPropagation(); onResetAvatar?.(); }} title="移除头像图片">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                )}
            </div>
        );
    };

    const renderCropModal = () => {
        if (!cropImageSrc) return null;
        return (
            <AvatarCropModal
                imageSrc={cropImageSrc}
                onCropComplete={handleCropComplete}
                onCancel={() => setCropImageSrc(null)}
            />
        );
    };

    if (heroStyle === 'minimal') {
        return (
            <>
                <div className="hero-section hero-minimal">
                    {renderAvatar()}
                    {isEditMode ? (
                        <input 
                            className="hero-username-input" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="用户名"
                            maxLength={25}
                        />
                    ) : (
                        username && <h1 className="hero-username">{username}</h1>
                    )}
                    <h2 className="hero-title">{greeting}</h2>
                    <div className="hero-divider-minimal"></div>
                    {isEditMode ? (
                        <textarea 
                            className="hero-bio-input" 
                            value={personalSign} 
                            onChange={(e) => setPersonalSign(e.target.value)}
                            placeholder="编辑个性签名..."
                            rows={4}
                            maxLength={200}
                        />
                    ) : (
                        <p className="hero-subtitle">{personalSign}</p>
                    )}
                    <div className="hero-minimal-footer">
                        {renderSocialLinks()}
                    </div>
                </div>
                {renderCropModal()}
            </>
        );
    }

    return (
        <>
            <div className="hero-section">
                <div 
                    className="hero-card"
                    style={{
                        backdropFilter: cardBlur > 0 ? `blur(${cardBlur}px)` : 'none',
                        WebkitBackdropFilter: cardBlur > 0 ? `blur(${cardBlur}px)` : 'none'
                    }}
                >
                    <div className="hero-header">
                        {renderAvatar()}
                    </div>
                    <div className="hero-content">
                        {isEditMode ? (
                            <input 
                                className="hero-username-input" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="用户名"
                                maxLength={25}
                            />
                        ) : (
                            username && <h1 className="hero-username">{username}</h1>
                        )}
                        <h2 className="hero-title">{greeting}</h2>
                        <div className="hero-divider"></div>
                        {isEditMode ? (
                            <textarea 
                                className="hero-bio-input" 
                                value={personalSign} 
                                onChange={(e) => setPersonalSign(e.target.value)}
                                placeholder="编辑个性签名..."
                                rows={4}
                                maxLength={200}
                            />
                        ) : (
                            <p className="hero-subtitle">{personalSign}</p>
                        )}
                    </div>
                    <div className="hero-card-footer">
                        {renderSocialLinks()}
                    </div>
                </div>
            </div>
            {renderCropModal()}
        </>
    );
}
