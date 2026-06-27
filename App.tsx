import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ExternalLink, 
  ChevronUp, 
  ChevronDown,
  Upload,
  Trash2,
  Plus
} from 'lucide-react';

interface ThemePreset {
  name: string;
  bgGrad: string;
  primary: string;
  accent: string;
  shape1: string;
  shape2: string;
  shape3: string;
  text: string;
}

const THEME_PRESETS: ThemePreset[] = [
  {
    name: "Golden Sunshine",
    bgGrad: "from-[#FCB714] to-[#FCB714]", // Exactly the yellow background from the color scheme
    primary: "#5C73F2", // Royal Blue
    accent: "#4CEE92",  // Mint Green
    shape1: "#B578FF",  // Purple/Lavender
    shape2: "#FC7488",  // Coral Pink
    shape3: "#6AD5FF",  // Light Cyan Blue
    text: "#110F0E"     // High contrast dark text for bright themes
  },
  {
    name: "Mint Coral",
    bgGrad: "from-[#3CE5A3] to-[#3CE5A3]", // Vibrant mint green
    primary: "#FF6B6B", // Coral Red
    accent: "#4D96FF",  // Bright Blue
    shape1: "#FFE162",  // Yellow Accent
    shape2: "#B578FF",  // Purple
    shape3: "#FF8C32",  // Orange
    text: "#110F0E"
  },
  {
    name: "Lilac Sage",
    bgGrad: "from-[#D6C7FF] to-[#D6C7FF]", // Soft purple-lilac
    primary: "#4A7C59", // Sage Green
    accent: "#FF5E7E",  // Rose Pink
    shape1: "#FFB84C",  // Honey Yellow
    shape2: "#1A5F7A",  // Deep Blue
    shape3: "#FFFFFF",  // Crisp White
    text: "#110F0E"
  },
  {
    name: "Teal Amber",
    bgGrad: "from-[#0F766E] to-[#115E59]", // Deep Teal for rich contrast
    primary: "#F59E0B", // Amber Orange
    accent: "#10B981",  // Mint Green
    shape1: "#3B82F6",  // Cobalt Blue
    shape2: "#EC4899",  // Hot Pink
    shape3: "#FDE68A",  // Pale Yellow
    text: "#FFFFFF"     // High contrast white text for dark themes
  }
];

interface ScheduledShape {
  id: number;
  colorKey: 'primary' | 'accent' | 'shape1' | 'shape2' | 'shape3';
  layouts: {
    x: string;
    y: string;
    width: string;
    height: string;
    rotate: number;
    opacity: number;
    borderRadius?: string;
    clipPath?: string;
  }[];
}

const GLOBAL_SHAPES: ScheduledShape[] = [
  // Shape 1: Royal Blue Stripe (Diagonal)
  {
    id: 1,
    colorKey: 'primary',
    layouts: [
      { x: '12%', y: '-15%', width: '90px', height: '135%', rotate: 15, opacity: 1 },
      { x: '-4%', y: '10%', width: '110px', height: '80%', rotate: -5, opacity: 0.8 },
      { x: '86%', y: '5%', width: '90px', height: '90%', rotate: 10, opacity: 0.8 },
      { x: '10%', y: '5%', width: '80%', height: '40px', rotate: -2, opacity: 0.9, borderRadius: '4px' },
      { x: '5%', y: '75%', width: '120px', height: '120px', rotate: -15, opacity: 0.7, borderRadius: '12px' },
      { x: '85%', y: '65%', width: '100px', height: '100px', rotate: 45, opacity: 0.8, borderRadius: '50%' }
    ]
  },
  // Shape 2: Mint Green Stripe (Diagonal)
  {
    id: 2,
    colorKey: 'accent',
    layouts: [
      { x: '24%', y: '-15%', width: '90px', height: '135%', rotate: -15, opacity: 1 },
      { x: '88%', y: '20%', width: '80px', height: '70%', rotate: 5, opacity: 0.8 },
      { x: '-3%', y: '25%', width: '100px', height: '60%', rotate: -12, opacity: 0.8 },
      { x: '10%', y: '88%', width: '80%', height: '30px', rotate: 3, opacity: 0.9, borderRadius: '4px' },
      { x: '82%', y: '15%', width: '110px', height: '110px', rotate: 30, opacity: 0.7, borderRadius: '50%' },
      { x: '10%', y: '10%', width: '130px', height: '70px', rotate: -8, opacity: 0.8, borderRadius: '8px' }
    ]
  },
  // Shape 3: Purple Triangle
  {
    id: 3,
    colorKey: 'shape1',
    layouts: [
      { x: '25%', y: '22%', width: '310px', height: '230px', rotate: -12, opacity: 1, clipPath: 'polygon(0% 30%, 100% 0%, 55% 100%)' },
      { x: '6%', y: '12%', width: '140px', height: '120px', rotate: 35, opacity: 0.7, clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' },
      { x: '76%', y: '68%', width: '160px', height: '140px', rotate: -30, opacity: 0.7, clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' },
      { x: '12%', y: '40%', width: '100px', height: '90px', rotate: 15, opacity: 0.8, clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' },
      { x: '15%', y: '65%', width: '180px', height: '160px', rotate: -25, opacity: 0.7, clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' },
      { x: '72%', y: '12%', width: '150px', height: '130px', rotate: 20, opacity: 0.8, clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }
    ]
  },
  // Shape 4: Pink Triangle
  {
    id: 4,
    colorKey: 'shape2',
    layouts: [
      { x: '42%', y: '30%', width: '340px', height: '260px', rotate: 22, opacity: 1, clipPath: 'polygon(15% 0%, 100% 55%, 0% 100%)' },
      { x: '76%', y: '65%', width: '170px', height: '145px', rotate: -15, opacity: 0.7, clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' },
      { x: '10%', y: '12%', width: '150px', height: '130px', rotate: 40, opacity: 0.7, clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' },
      { x: '78%', y: '18%', width: '110px', height: '100px', rotate: -10, opacity: 0.8, clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' },
      { x: '45%', y: '78%', width: '140px', height: '120px', rotate: 15, opacity: 0.7, clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' },
      { x: '5%', y: '45%', width: '160px', height: '140px', rotate: -35, opacity: 0.8, clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }
    ]
  },
  // Shape 5: Light Cyan Blue Triangle
  {
    id: 5,
    colorKey: 'shape3',
    layouts: [
      { x: '38%', y: '15%', width: '260px', height: '190px', rotate: -28, opacity: 1, clipPath: 'polygon(45% 0%, 100% 100%, 0% 65%)' },
      { x: '44%', y: '45%', width: '190px', height: '170px', rotate: 15, opacity: 0.6, clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' },
      { x: '46%', y: '35%', width: '210px', height: '180px', rotate: -40, opacity: 0.6, clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' },
      { x: '78%', y: '62%', width: '115px', height: '105px', rotate: 45, opacity: 0.8, clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' },
      { x: '82%', y: '48%', width: '135px', height: '115px', rotate: -15, opacity: 0.7, clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' },
      { x: '45%', y: '12%', width: '175px', height: '145px', rotate: 10, opacity: 0.8, clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }
    ]
  }
];

interface Message {
  id: string;
  name: string;
  content: string;
  time: string;
  avatarColor: string;
  avatarIcon: string;
}

const SEEDED_MESSAGES: Message[] = [
  {
    id: 'seed-1',
    name: '米卡Mika',
    content: '这次的 8-Bit 合成器作品太抓耳了！晶体管那种温润的暖意和机械感融合得刚好！',
    time: '3小时前',
    avatarColor: '#5C73F2',
    avatarIcon: '👾'
  },
  {
    id: 'seed-2',
    name: '声音旅行者',
    content: 'Studio 的设备搭配好酷，听说你用了很多经典合成器，期待能在小红书看到更多的设备分享！',
    time: '昨天',
    avatarColor: '#FF6B6B',
    avatarIcon: '🎹'
  },
  {
    id: 'seed-3',
    name: '极客小明',
    content: '音画交互网页做得很硬核，用 Framer Motion 做的这个过渡太丝滑了。给数字极客点赞！',
    time: '2天前',
    avatarColor: '#4CEE92',
    avatarIcon: '⚡'
  },
  {
    id: 'seed-4',
    name: '幻音天姬',
    content: '二次元声音设计赛道强推！网易云的那首纯音乐循环播放好几天了，支持支持！',
    time: '3天前',
    avatarColor: '#B578FF',
    avatarIcon: '🎧'
  }
];

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [prevPage, setPrevPage] = useState<number>(0);
  const [activeThemeIdx, setActiveThemeIdx] = useState<number>(0);
  
  // Aspect ratio self-adaptation settings: 'fluid' (default), '9-16' (mobile), '3-4' (tablet)
  const [aspectRatio, setAspectRatio] = useState<'fluid' | '9-16' | '3-4'>('fluid');

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState<boolean>(() => {
    return localStorage.getItem('lgzj_is_edit_mode') === 'true';
  });

  // Editable logo text state
  const [logoText, setLogoText] = useState<string>(() => {
    return localStorage.getItem('lgzj_logo_text') || 'L-Gzj';
  });

  // Editable introduction state
  const [introduction, setIntroduction] = useState<string>(() => {
    return localStorage.getItem('lgzj_introduction') || 'L-Gzj 是一位专注探索的二次元声音创作者与数字极客，沉浸于声音设计、8-Bit / 16-Bit 晶体管合成以及虚拟世界的音画交互。';
  });

  // Local image replacement states
  const [image2, setImage2] = useState<string>(() => {
    return localStorage.getItem('lgzj_img2') || '/src/assets/images/studio_full_view_1782593998885.jpg';
  });
  const [image3, setImage3] = useState<string>(() => {
    return localStorage.getItem('lgzj_img3') || '/src/assets/images/studio_desk_closeup_1782594012599.jpg';
  });

  const fileInputRef2 = useRef<HTMLInputElement>(null);
  const fileInputRef3 = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, slideNum: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (slideNum === 2) {
          setImage2(base64String);
          localStorage.setItem('lgzj_img2', base64String);
        } else if (slideNum === 3) {
          setImage3(base64String);
          localStorage.setItem('lgzj_img3', base64String);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = (slideNum: number) => {
    if (slideNum === 2) {
      setImage2('');
      localStorage.removeItem('lgzj_img2');
    } else if (slideNum === 3) {
      setImage3('');
      localStorage.removeItem('lgzj_img3');
    }
  };

  // Synchronize theme index sequentially with current page automatically
  useEffect(() => {
    setActiveThemeIdx(currentPage % THEME_PRESETS.length);
  }, [currentPage]);

  // Message board guestbook states
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('lgzj_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return SEEDED_MESSAGES;
      }
    }
    return SEEDED_MESSAGES;
  });
  const [inputName, setInputName] = useState('');
  const [inputContent, setInputContent] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('👾');

  const EMOJIS = ['👾', '🎹', '🎧', '⚡', '🌟', '💿', '🎵', '🕹️'];

  useEffect(() => {
    localStorage.setItem('lgzj_messages', JSON.stringify(messages));
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim() || !inputContent.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      name: inputName.trim().slice(0, 12),
      content: inputContent.trim().slice(0, 100),
      time: '刚刚',
      avatarColor: THEME_PRESETS[Math.floor(Math.random() * THEME_PRESETS.length)].primary,
      avatarIcon: selectedEmoji
    };

    setMessages(prev => [newMessage, ...prev]);
    setInputName('');
    setInputContent('');
  };

  const lastWheelTime = useRef<number>(0);
  const touchStartY = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const currentTheme = THEME_PRESETS[activeThemeIdx];

  const handleNextPage = () => {
    if (currentPage < 5) {
      setPrevPage(currentPage);
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setPrevPage(currentPage);
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleGoToPage = (index: number) => {
    if (index !== currentPage && index >= 0 && index <= 5) {
      setPrevPage(currentPage);
      setCurrentPage(index);
    }
  };

  // Wheel scrolling (desktop)
  const onWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTime.current < 650) return;

    if (e.deltaY > 25) {
      handleNextPage();
      lastWheelTime.current = now;
    } else if (e.deltaY < -25) {
      handlePrevPage();
      lastWheelTime.current = now;
    }
  };

  // Touch swipes (mobile / trackpad gestures)
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.targetTouches[0].clientY;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null || touchStartX.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const touchEndX = e.changedTouches[0].clientX;
    const diffY = touchStartY.current - touchEndY;
    const diffX = touchStartX.current - touchEndX;
    const minSwipe = 40;

    if (Math.abs(diffY) > Math.abs(diffX)) {
      if (diffY > minSwipe) {
        handleNextPage();
      } else if (diffY < -minSwipe) {
        handlePrevPage();
      }
    } else {
      if (diffX > minSwipe) {
        handleNextPage();
      } else if (diffX < -minSwipe) {
        handlePrevPage();
      }
    }
    touchStartY.current = null;
    touchStartX.current = null;
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        handleNextPage();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrevPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage]);

  const slideVariants = {
    enter: (toRight: boolean) => ({
      y: toRight ? '100%' : '-100%',
      opacity: 0,
      scale: 0.96,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }),
    center: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    },
    exit: (toRight: boolean) => ({
      y: toRight ? '-100%' : '100%',
      opacity: 0,
      scale: 0.96,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    })
  };

  const toRight = currentPage >= prevPage;

  return (
    <div
      className={`w-full h-full relative overflow-hidden flex flex-col justify-center items-center h5-container select-none bg-gradient-to-b ${currentTheme.bgGrad} transition-colors duration-1000`}
      onWheel={onWheel}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      id="root-viewport"
    >
      {/* Semi-translucent mask when not in fluid mode to make the mockup stand out beautifully */}
      {aspectRatio !== 'fluid' && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-none z-10 transition-all duration-500 animate-fade-in" />
      )}

      {/* Grid Overlay with light opacity to enrich flat details */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06] bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:20px_20px] z-10" />

      {/* Interactive responsive wrapper container holding the actual content */}
      <div
        className={
          aspectRatio === 'fluid'
            ? 'w-full h-full relative overflow-hidden flex flex-col z-20 transition-all duration-500'
            : aspectRatio === '9-16'
              ? `aspect-[9/16] h-[85vh] max-h-[850px] max-w-[95vw] border-4 border-black bg-gradient-to-b ${currentTheme.bgGrad} shadow-flat-xl rounded-2xl relative overflow-hidden flex flex-col z-20 transition-all duration-500`
              : `aspect-[3/4] h-[82vh] max-h-[780px] max-w-[95vw] border-4 border-black bg-gradient-to-b ${currentTheme.bgGrad} shadow-flat-xl rounded-none relative overflow-hidden flex flex-col z-20 transition-all duration-500`
        }
        id="h5-canvas-wrapper"
      >
        {/* SCHEDULED GEOMETRIC SHAPES */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {GLOBAL_SHAPES.map(shape => {
            const layout = shape.layouts[currentPage] || shape.layouts[0];
            
            let bgColor = currentTheme.primary;
            if (shape.colorKey === 'accent') bgColor = currentTheme.accent;
            if (shape.colorKey === 'shape1') bgColor = currentTheme.shape1;
            if (shape.colorKey === 'shape2') bgColor = currentTheme.shape2;
            if (shape.colorKey === 'shape3') bgColor = currentTheme.shape3;

            return (
              <motion.div
                key={shape.id}
                className="absolute"
                animate={{
                  left: layout.x,
                  top: layout.y,
                  width: layout.width,
                  height: layout.height,
                  rotate: layout.rotate,
                  borderRadius: layout.borderRadius || '0px',
                  opacity: layout.opacity
                }}
                transition={{
                  type: 'spring',
                  stiffness: 75,
                  damping: 15,
                  mass: 1.05
                }}
                style={{
                  backgroundColor: bgColor,
                  clipPath: layout.clipPath || 'none',
                }}
              />
            );
          })}
        </div>

        {/* FIXED COMPACT HEADER */}
        <div className="absolute top-8 left-0 right-0 px-8 sm:px-12 z-50 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3">
            <span 
              className="w-3 h-3 rounded-full border-2 border-black shadow-flat-sm" 
              style={{ backgroundColor: currentTheme.primary }} 
            />
            <span 
              className="font-display font-black tracking-widest text-sm sm:text-base uppercase"
              style={{ color: currentTheme.text }}
            >
              {logoText}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Aspect Ratio adapt selector pill */}
            <div className="flex bg-white border-2 border-black p-0.5 shadow-flat select-none pointer-events-auto">
              {(['fluid', '9-16', '3-4'] as const).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase transition-all ${
                    aspectRatio === ratio
                      ? 'bg-black text-white'
                      : 'text-black hover:bg-gray-100'
                  }`}
                  title={`比例: ${ratio === 'fluid' ? '自适应' : ratio === '9-16' ? '手机 9:16' : '平板 3:4'}`}
                >
                  {ratio === 'fluid' ? '自适应' : ratio === '9-16' ? '9:16' : '3:4'}
                </button>
              ))}
            </div>

            {/* Edit Mode toggle button */}
            <button
              onClick={() => {
                const nextVal = !isEditMode;
                setIsEditMode(nextVal);
                localStorage.setItem('lgzj_is_edit_mode', String(nextVal));
              }}
              className={`px-3 py-1 text-[10px] sm:text-xs font-display font-black uppercase tracking-wider transition-all border-2 border-black shadow-flat active:translate-x-0.5 active:translate-y-0.5 ${
                isEditMode 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-white text-black hover:bg-black hover:text-white'
              }`}
              title={isEditMode ? "保存并退出编辑" : "开启编辑模式"}
            >
              {isEditMode ? "💾 退出编辑" : "✏️ 编辑模式"}
            </button>

            {/* Hidden Input elements for image replacement */}
            <input
              type="file"
              ref={fileInputRef2}
              onChange={(e) => handleImageChange(e, 2)}
              accept="image/*"
              className="hidden"
            />
            <input
              type="file"
              ref={fileInputRef3}
              onChange={(e) => handleImageChange(e, 3)}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        {/* SLIDING CANVAS */}
        <div className="flex-1 w-full h-full relative z-20">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentPage}
              custom={toRight}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 w-full h-full overflow-hidden flex flex-col justify-between gpu-accelerated"
              id={`slide-${currentPage}`}
            >
              {/* SLIDE 0: BRAND LOGO COVER (GOLDEN POSITION) */}
              {currentPage === 0 && (
                <div className="w-full h-full flex flex-col justify-center items-center px-8 sm:px-16 max-w-3xl mx-auto text-center">
                  {isEditMode ? (
                    <div className="bg-white border-4 border-black p-6 sm:p-8 shadow-flat-lg rounded-none w-full max-w-md text-left z-30 relative animate-fade-in">
                      <h3 className="font-display font-black text-xl uppercase tracking-tight text-black mb-1">
                        Edit Brand Logo Name
                      </h3>
                      <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-4">
                        品牌 LOGO 名称编辑
                      </p>
                      <div className="space-y-4">
                        <div>
                          <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-black mb-1">
                            Logo 名字 / Logo Name
                          </label>
                          <input
                            type="text"
                            value={logoText}
                            onChange={(e) => {
                              const val = e.target.value.slice(0, 16);
                              setLogoText(val);
                              localStorage.setItem('lgzj_logo_text', val);
                            }}
                            className="w-full p-3 font-sans font-extrabold text-lg border-2 border-black focus:outline-none focus:bg-gray-50 text-black bg-white rounded-none"
                            placeholder="例如: L-Gzj"
                          />
                        </div>
                        <p className="font-sans text-xs text-gray-500 leading-normal">
                          提示：编辑此处的 Logo 名字将实时、全局同步应用到头部导航、主页封套和第三方链接卡片。
                        </p>
                      </div>
                    </div>
                  ) : (
                    <motion.div layoutId="logo-block" className="flex flex-col items-center select-none cursor-pointer">
                      <motion.h1 layoutId="logo-text" className="relative font-display font-black leading-none uppercase select-none text-7xl sm:text-9xl">
                        <span 
                          className="absolute left-[6px] top-[6px] text-7xl sm:text-9xl tracking-tighter opacity-20 pointer-events-none"
                          style={{ color: currentTheme.primary }}
                        >
                          {logoText}
                        </span>
                        <span className="relative text-white tracking-tighter text-7xl sm:text-9xl">
                          {logoText}
                        </span>
                      </motion.h1>
                      <motion.div layoutId="logo-badge" className="mt-4 bg-black text-white border-2 border-black px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-widest shadow-flat">
                        Sound Creator & Digital Geek
                      </motion.div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* SLIDE 1: INTRODUCTION CARD (LOGO SHRINKS AND MOVES NEXT TO TEXT) */}
              {currentPage === 1 && (
                <div className="w-full h-full flex flex-col justify-center px-8 sm:px-16 max-w-4xl mx-auto">
                  <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 w-full">
                    <motion.div layoutId="logo-block" className="flex flex-col items-center md:items-start select-none shrink-0">
                      <motion.h1 layoutId="logo-text" className="relative font-display font-black leading-none uppercase select-none text-5xl sm:text-6xl md:text-7xl">
                        <span 
                          className="absolute left-[4px] top-[4px] text-5xl sm:text-6xl md:text-7xl tracking-tighter opacity-20 pointer-events-none"
                          style={{ color: currentTheme.primary }}
                        >
                          {logoText}
                        </span>
                        <span className="relative text-white tracking-tighter text-5xl sm:text-6xl md:text-7xl">
                          {logoText}
                        </span>
                      </motion.h1>
                      <motion.div layoutId="logo-badge" className="mt-2 bg-black text-white border-2 border-black px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider shadow-flat-sm">
                        Sound Creator
                      </motion.div>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -30 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="p-6 sm:p-8 bg-white border-4 border-black shadow-flat-lg rounded-none max-w-md transition-all flex-1 z-30"
                    >
                      {isEditMode ? (
                        <div className="flex flex-col gap-2">
                          <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-black">
                            编辑个人简介 / Edit Introduction
                          </label>
                          <textarea
                            value={introduction}
                            onChange={(e) => {
                              setIntroduction(e.target.value);
                              localStorage.setItem('lgzj_introduction', e.target.value);
                            }}
                            rows={4}
                            className="w-full p-2.5 text-xs sm:text-sm text-black font-sans font-bold border-2 border-black focus:outline-none focus:bg-gray-50 bg-white resize-none rounded-none animate-fade-in"
                            placeholder="输入您的简介..."
                          />
                          <p className="font-mono text-[9px] text-gray-400">
                            提示：内容会自动保存。
                          </p>
                        </div>
                      ) : (
                        <p className="font-sans text-sm sm:text-base md:text-lg text-black leading-relaxed font-bold">
                          {introduction}
                        </p>
                      )}
                    </motion.div>
                  </div>
                </div>
              )}

              {/* SLIDE 2: STUDIO SPACE ORIGINAL PHOTO */}
              {currentPage === 2 && (
                <div className="w-full h-full flex items-center justify-center p-6 sm:p-12">
                  <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 max-w-4xl w-full">
                    {image2 ? (
                      <div className="relative group w-fit h-fit border-4 border-black shadow-flat-lg bg-white overflow-hidden flex items-center justify-center">
                        <img
                          src={image2}
                          alt="L-Gzj Studio View"
                          className="max-h-[45vh] sm:max-h-[50vh] max-w-[80vw] md:max-w-[50vw] w-auto h-auto block object-contain animate-fade-in"
                          referrerPolicy="no-referrer"
                        />
                        {/* Control buttons overlay ONLY in Edit Mode */}
                        {isEditMode && (
                          <div className="absolute top-3 right-3 flex items-center gap-2 z-30">
                            <button
                              onClick={() => fileInputRef2.current?.click()}
                              className="w-8 h-8 rounded-full bg-white border-2 border-black hover:bg-black hover:text-white text-black flex items-center justify-center transition-all shadow-flat active:translate-x-0.5 active:translate-y-0.5 pointer-events-auto"
                              title="Replace Image"
                            >
                              <Upload className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteImage(2)}
                              className="w-8 h-8 rounded-full bg-white border-2 border-black hover:bg-red-500 hover:text-white text-black flex items-center justify-center transition-all shadow-flat active:translate-x-0.5 active:translate-y-0.5 pointer-events-auto"
                              title="Delete Image"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      isEditMode ? (
                        <div 
                          onClick={() => fileInputRef2.current?.click()}
                          className="group relative w-full max-w-md aspect-video cursor-pointer bg-white/50 hover:bg-white border-4 border-dashed border-black shadow-flat-lg flex flex-col items-center justify-center p-6 transition-all"
                        >
                          <Plus className="w-10 h-10 text-black mb-3 group-hover:scale-110 transition-transform" />
                          <span className="font-display font-black text-sm uppercase tracking-wider text-black">
                            上传本地图片
                          </span>
                          <span className="font-mono text-[10px] text-gray-500 mt-1 uppercase tracking-widest">
                            自适应任意比例缩放
                          </span>
                        </div>
                      ) : (
                        <div className="w-full max-w-md aspect-video bg-white/30 border-4 border-black border-dashed flex flex-col items-center justify-center p-6 text-center select-none shadow-flat">
                          <span className="text-4xl mb-2">📸</span>
                          <p className="font-display font-black text-sm uppercase tracking-wider text-black">
                            Studio Photo (Empty)
                          </p>
                          <p className="font-mono text-[9px] text-gray-500 uppercase tracking-widest mt-1">
                            请在右上角开启 “编辑模式” 上传图片
                          </p>
                        </div>
                      )
                    )}
                    {/* Studio Label Badge */}
                    <div className="bg-white border-4 border-black p-4 md:p-6 shadow-flat flex md:flex-col items-center justify-center gap-2 rotate-1 md:-rotate-2 min-w-[140px]">
                      <span className="font-display font-black text-2xl sm:text-3xl tracking-wider uppercase text-black">
                        Studio
                      </span>
                      <span className="font-mono text-xs font-bold text-gray-500 uppercase tracking-widest hidden md:inline">
                        Full View
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 3: STUDIO DESK DETAIL ORIGINAL PHOTO */}
              {currentPage === 3 && (
                <div className="w-full h-full flex items-center justify-center p-6 sm:p-12">
                  <div className="flex flex-col md:flex-row-reverse items-center justify-center gap-6 md:gap-8 max-w-4xl w-full">
                    {image3 ? (
                      <div className="relative group w-fit h-fit border-4 border-black shadow-flat-lg bg-white overflow-hidden flex items-center justify-center">
                        <img
                          src={image3}
                          alt="L-Gzj Desk View"
                          className="max-h-[45vh] sm:max-h-[50vh] max-w-[80vw] md:max-w-[50vw] w-auto h-auto block object-contain animate-fade-in"
                          referrerPolicy="no-referrer"
                        />
                        {/* Control buttons overlay ONLY in Edit Mode */}
                        {isEditMode && (
                          <div className="absolute top-3 right-3 flex items-center gap-2 z-30">
                            <button
                              onClick={() => fileInputRef3.current?.click()}
                              className="w-8 h-8 rounded-full bg-white border-2 border-black hover:bg-black hover:text-white text-black flex items-center justify-center transition-all shadow-flat active:translate-x-0.5 active:translate-y-0.5 pointer-events-auto"
                              title="Replace Image"
                            >
                              <Upload className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteImage(3)}
                              className="w-8 h-8 rounded-full bg-white border-2 border-black hover:bg-red-500 hover:text-white text-black flex items-center justify-center transition-all shadow-flat active:translate-x-0.5 active:translate-y-0.5 pointer-events-auto"
                              title="Delete Image"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      isEditMode ? (
                        <div 
                          onClick={() => fileInputRef3.current?.click()}
                          className="group relative w-full max-w-md aspect-video cursor-pointer bg-white/50 hover:bg-white border-4 border-dashed border-black shadow-flat-lg flex flex-col items-center justify-center p-6 transition-all"
                        >
                          <Plus className="w-10 h-10 text-black mb-3 group-hover:scale-110 transition-transform" />
                          <span className="font-display font-black text-sm uppercase tracking-wider text-black">
                            上传本地图片
                          </span>
                          <span className="font-mono text-[10px] text-gray-500 mt-1 uppercase tracking-widest">
                            自适应任意比例缩放
                          </span>
                        </div>
                      ) : (
                        <div className="w-full max-w-md aspect-video bg-white/30 border-4 border-black border-dashed flex flex-col items-center justify-center p-6 text-center select-none shadow-flat">
                          <span className="text-4xl mb-2">📸</span>
                          <p className="font-display font-black text-sm uppercase tracking-wider text-black">
                            Desk Photo (Empty)
                          </p>
                          <p className="font-mono text-[9px] text-gray-500 uppercase tracking-widest mt-1">
                            请在右上角开启 “编辑模式” 上传图片
                          </p>
                        </div>
                      )
                    )}
                    {/* Studio Label Badge */}
                    <div className="bg-white border-4 border-black p-4 md:p-6 shadow-flat flex md:flex-col items-center justify-center gap-2 -rotate-1 md:rotate-2 min-w-[140px]">
                      <span className="font-display font-black text-2xl sm:text-3xl tracking-wider uppercase text-black">
                        Studio
                      </span>
                      <span className="font-mono text-xs font-bold text-gray-500 uppercase tracking-widest hidden md:inline">
                        Desk Detail
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 4: LINKS */}
              {currentPage === 4 && (
                <div className="w-full h-full flex flex-col justify-center px-8 sm:px-16 max-w-md mx-auto">
                  <div className="space-y-6">
                    <h2 className="relative font-display font-black text-5xl sm:text-6xl tracking-tight uppercase select-none text-center">
                      <span 
                        className="absolute left-[3px] top-[3px] opacity-20 pointer-events-none"
                        style={{ color: currentTheme.primary }}
                      >
                        {logoText}
                      </span>
                      <span className="relative text-white">
                        {logoText}
                      </span>
                    </h2>

                    {/* Clean flat-style high-contrast navigation links */}
                    <div className="flex flex-col gap-4 pt-2">
                      <a
                        href="https://b23.tv/gHcFCBl"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between p-4 bg-white border-2 border-black text-black font-display font-black tracking-tight text-sm sm:text-base uppercase rounded-none hover:bg-black hover:text-white transition-all shadow-flat active:translate-x-0.5 active:translate-y-0.5"
                        id="link-bilibili"
                      >
                        <span>Bilibili</span>
                        <ExternalLink className="w-4 h-4 text-black group-hover:text-white transition-all" />
                      </a>

                      <a
                        href="https://y.music.163.com/m/user?id=604626568"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between p-4 bg-white border-2 border-black text-black font-display font-black tracking-tight text-sm sm:text-base uppercase rounded-none hover:bg-black hover:text-white transition-all shadow-flat active:translate-x-0.5 active:translate-y-0.5"
                        id="link-netease"
                      >
                        <span>网易云音乐</span>
                        <ExternalLink className="w-4 h-4 text-black group-hover:text-white transition-all" />
                      </a>

                      <a
                        href="https://xhslink.com/m/AGJy3ed47iL"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between p-4 bg-white border-2 border-black text-black font-display font-black tracking-tight text-sm sm:text-base uppercase rounded-none hover:bg-black hover:text-white transition-all shadow-flat active:translate-x-0.5 active:translate-y-0.5"
                        id="link-rednote"
                      >
                        <span>小红书</span>
                        <ExternalLink className="w-4 h-4 text-black group-hover:text-white transition-all" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 5: GUESTBOOK / 留言页 */}
              {currentPage === 5 && (
                <div className="w-full h-full flex flex-col justify-center px-6 sm:px-12 max-w-4xl mx-auto py-16 overflow-y-auto no-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch w-full max-h-[75vh]">
                    {/* Left Side: Message Input Form (5 cols) */}
                    <div className="md:col-span-5 flex flex-col justify-center">
                      <div className="bg-white border-4 border-black p-4 sm:p-5 shadow-flat-md flex flex-col h-full justify-between">
                        <div>
                          <h3 className="font-display font-black text-lg sm:text-xl uppercase tracking-tight text-black mb-1">
                            Leave a Message
                          </h3>
                          <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-4">
                            留言板 / GUESTBOOK
                          </p>
                        </div>
                        
                        <form onSubmit={handleSendMessage} className="space-y-3.5">
                          <div>
                            <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-black mb-1">
                              昵称 / Nickname
                            </label>
                            <input
                              type="text"
                              required
                              value={inputName}
                              onChange={(e) => setInputName(e.target.value)}
                              placeholder="创作者昵称..."
                              className="w-full p-2 text-xs sm:text-sm font-sans font-bold border-2 border-black focus:outline-none focus:bg-gray-50 text-black bg-white placeholder-gray-400 rounded-none"
                            />
                          </div>

                          <div>
                            <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-black mb-1">
                              头像符号 / Avatar Symbol
                            </label>
                            <div className="flex flex-wrap gap-1.5 p-1 bg-gray-100 border-2 border-black">
                              {EMOJIS.map(emoji => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => setSelectedEmoji(emoji)}
                                  className={`w-6 h-6 flex items-center justify-center text-sm border transition-all ${
                                    selectedEmoji === emoji 
                                      ? 'bg-black text-white border-black scale-110' 
                                      : 'bg-white hover:bg-gray-50 border-gray-300'
                                  }`}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-black mb-1">
                              留言内容 / Message
                            </label>
                            <textarea
                              required
                              rows={2}
                              maxLength={100}
                              value={inputContent}
                              onChange={(e) => setInputContent(e.target.value)}
                              placeholder="说点好听的话..."
                              className="w-full p-2 text-xs sm:text-sm font-sans font-bold border-2 border-black focus:outline-none focus:bg-gray-50 text-black bg-white placeholder-gray-400 resize-none rounded-none"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full p-2.5 bg-black text-white font-display font-black text-xs sm:text-sm uppercase tracking-widest border-2 border-black shadow-flat hover:bg-white hover:text-black active:translate-x-0.5 active:translate-y-0.5 transition-all"
                          >
                            发送留言 SEND
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* Right Side: Message List (7 cols) */}
                    <div className="md:col-span-7 flex flex-col">
                      <div className="bg-black/5 border-4 border-black p-4 flex flex-col h-full min-h-[220px] md:min-h-0 justify-between">
                        <div className="overflow-y-auto pr-1 space-y-3 max-h-[300px] md:max-h-[380px] no-scrollbar flex-1">
                          <AnimatePresence initial={false}>
                            {messages.map((msg) => (
                              <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="p-3 bg-white border-2 border-black shadow-flat flex gap-3 items-start"
                              >
                                <div 
                                  className="w-8 h-8 rounded-full border border-black flex items-center justify-center text-base shrink-0 shadow-flat-sm"
                                  style={{ backgroundColor: msg.avatarColor }}
                                >
                                  {msg.avatarIcon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-0.5">
                                    <span className="font-sans font-extrabold text-xs text-black truncate">
                                      {msg.name}
                                    </span>
                                    <span className="font-mono text-[9px] text-gray-500 shrink-0">
                                      {msg.time}
                                    </span>
                                  </div>
                                  <p className="font-sans text-xs font-bold text-gray-700 leading-normal break-words">
                                    {msg.content}
                                  </p>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                        
                        <div className="mt-2 text-center">
                          <span className="font-mono text-[9px] text-black/40 font-bold uppercase tracking-widest">
                            已显示 {messages.length} 条留言
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* FIXED PAGINATION DOTS (HIGH-CONTRAST FLAT DESIGN) */}
        <div className="absolute right-6 sm:right-10 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
          {[0, 1, 2, 3, 4, 5].map((idx) => (
            <button
              key={idx}
              onClick={() => handleGoToPage(idx)}
              className="w-3.5 h-3.5 rounded-full transition-all duration-300 pointer-events-auto border-2 border-black shadow-flat-sm"
              style={{
                height: idx === currentPage ? '28px' : '14px',
                backgroundColor: idx === currentPage ? currentTheme.primary : '#FFFFFF'
              }}
              id={`indicator-${idx}`}
              title={`Go to Slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* BOTTOM DIRECTION INDICATORS (FLAT SCHEME) */}
        <div className="absolute bottom-6 left-0 right-0 z-40 flex justify-center gap-4 pointer-events-auto">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className={`w-10 h-10 rounded-full flex items-center justify-center bg-white border-2 border-black text-black hover:bg-black hover:text-white transition-all shadow-flat ${
              currentPage === 0 ? 'opacity-20 cursor-not-allowed' : 'active:translate-x-0.5 active:translate-y-0.5'
            }`}
            id="prev-btn"
            title="Previous Page"
          >
            <ChevronUp className="w-5 h-5" />
          </button>

          <button
            onClick={handleNextPage}
            disabled={currentPage === 5}
            className={`w-10 h-10 rounded-full flex items-center justify-center bg-white border-2 border-black text-black hover:bg-black hover:text-white transition-all shadow-flat ${
              currentPage === 5 ? 'opacity-20 cursor-not-allowed' : 'active:translate-x-0.5 active:translate-y-0.5'
            }`}
            id="next-btn"
            title="Next Page"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Premium minimal horizontal visual scroll line representing dynamic system feel */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-20 h-0.5 bg-black/15 rounded-full z-40 pointer-events-none" />
      </div>
    </div>
  );
};

export default App;
