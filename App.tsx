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
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc,
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut 
} from 'firebase/auth';
import { db, auth } from './src/firebase';

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

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const compressImage = (file: File, maxWidth = 1000, maxHeight = 1000, quality = 0.65): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve('');
      };
    };
    reader.onerror = () => {
      resolve('');
    };
  });
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [prevPage, setPrevPage] = useState<number>(0);
  const [activeThemeIdx, setActiveThemeIdx] = useState<number>(0);
  
  // Interactive stereoscopic 3D parallax offsets
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  
  // Aspect ratio self-adaptation settings: 'fluid' (default), '9-16' (mobile), '3-4' (tablet)
  const [aspectRatio, setAspectRatio] = useState<'fluid' | '9-16' | '3-4'>('fluid');

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // Editable logo text state
  const [logoText, setLogoText] = useState<string>('L-Gzj');

  // Editable introduction state
  const [introduction, setIntroduction] = useState<string>('L-Gzj 是一位专注探索的二次元声音创作者与数字极客，沉浸于声音设计、8-Bit / 16-Bit 晶体管合成以及虚拟世界的音画交互。');

  // Local image replacement states
  const [image2, setImage2] = useState<string>('/src/assets/images/studio_full_view_1782593998885.jpg');
  const [image3, setImage3] = useState<string>('/src/assets/images/studio_desk_closeup_1782594012599.jpg');

  // Auth states
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authErrorMsg, setAuthErrorMsg] = useState('');

  const fileInputRef2 = useRef<HTMLInputElement>(null);
  const fileInputRef3 = useRef<HTMLInputElement>(null);

  // Listen for Auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (user && user.email === 'lgzj416@gmail.com') {
        // Automatically set Edit Mode true when owner logs in
        setIsEditMode(true);
      } else {
        setIsEditMode(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load site config settings from Firestore on boot
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'main');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.logoText) setLogoText(data.logoText);
          if (data.introduction) setIntroduction(data.introduction);
          if (data.image2 !== undefined) setImage2(data.image2);
          if (data.image3 !== undefined) setImage3(data.image3);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'settings/main');
      }
    };
    loadSettings();
  }, []);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, slideNum: number) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file, 1000, 1000, 0.6);
        if (slideNum === 2) {
          setImage2(compressedBase64);
          if (auth.currentUser && auth.currentUser.email === 'lgzj416@gmail.com') {
            try {
              await setDoc(doc(db, 'settings', 'main'), {
                logoText,
                introduction,
                image2: compressedBase64,
                image3,
                updatedAt: new Date().toISOString()
              }, { merge: true });
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, 'settings/main');
            }
          }
        } else if (slideNum === 3) {
          setImage3(compressedBase64);
          if (auth.currentUser && auth.currentUser.email === 'lgzj416@gmail.com') {
            try {
              await setDoc(doc(db, 'settings', 'main'), {
                logoText,
                introduction,
                image2,
                image3: compressedBase64,
                updatedAt: new Date().toISOString()
              }, { merge: true });
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, 'settings/main');
            }
          }
        }
      } catch (error) {
        console.error("Failed to compress image:", error);
      }
    }
  };

  const handleDeleteImage = async (slideNum: number) => {
    if (slideNum === 2) {
      setImage2('');
      if (auth.currentUser && auth.currentUser.email === 'lgzj416@gmail.com') {
        try {
          await setDoc(doc(db, 'settings', 'main'), {
            logoText,
            introduction,
            image2: '',
            image3,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, 'settings/main');
        }
      }
    } else if (slideNum === 3) {
      setImage3('');
      if (auth.currentUser && auth.currentUser.email === 'lgzj416@gmail.com') {
        try {
          await setDoc(doc(db, 'settings', 'main'), {
            logoText,
            introduction,
            image2,
            image3: '',
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, 'settings/main');
        }
      }
    }
  };

  // Synchronize theme index sequentially with current page automatically
  useEffect(() => {
    setActiveThemeIdx(currentPage % THEME_PRESETS.length);
  }, [currentPage]);

  // Message board guestbook states and Firebase sync
  const [messages, setMessages] = useState<Message[]>(SEEDED_MESSAGES);
  const [inputName, setInputName] = useState('');
  const [inputContent, setInputContent] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('👾');

  const [deletedSeedIds, setDeletedSeedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('deleted_seed_message_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

  const EMOJIS = ['👾', '🎹', '🎧', '⚡', '🌟', '💿', '🎵', '🕹️'];

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages: Message[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        loadedMessages.push({
          id: data.id,
          name: data.name,
          content: data.content,
          time: data.time || '刚刚',
          avatarColor: data.avatarColor,
          avatarIcon: data.avatarIcon
        });
      });
      if (loadedMessages.length > 0) {
        setMessages(loadedMessages);
      } else {
        setMessages(SEEDED_MESSAGES);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'messages');
    });
    return () => unsubscribe();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim() || !inputContent.trim()) return;

    const messageId = Date.now().toString();
    const formattedTime = new Date().toLocaleDateString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const newMessage: Message = {
      id: messageId,
      name: inputName.trim().slice(0, 12),
      content: inputContent.trim().slice(0, 100),
      time: formattedTime,
      avatarColor: THEME_PRESETS[Math.floor(Math.random() * THEME_PRESETS.length)].primary,
      avatarIcon: selectedEmoji
    };

    try {
      await setDoc(doc(db, 'messages', messageId), {
        ...newMessage,
        createdAt: serverTimestamp()
      });
      setInputName('');
      setInputContent('');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `messages/${messageId}`);
    }
  };

  const handleToggleEditMode = async () => {
    if (isEditMode) {
      // Exiting Edit Mode -> SAVE Logo Text & Introduction to Firestore!
      if (currentUser && currentUser.email === 'lgzj416@gmail.com') {
        try {
          await setDoc(doc(db, 'settings', 'main'), {
            logoText,
            introduction,
            image2,
            image3,
            updatedAt: new Date().toISOString()
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, 'settings/main');
        }
      }
      setIsEditMode(false);
    } else {
      // Entering Edit Mode -> Check if logged in as owner
      if (currentUser && currentUser.email === 'lgzj416@gmail.com') {
        setIsEditMode(true);
      } else {
        setShowAuthModal(true);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthErrorMsg('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (user.email === 'lgzj416@gmail.com') {
        setIsEditMode(true);
        setShowAuthModal(false);
      } else {
        setAuthErrorMsg('验证失败：只有站长(lgzj416@gmail.com)拥有此站点的编辑和管理权限。');
        await signOut(auth);
      }
    } catch (error: any) {
      console.error('Google Auth Error:', error);
      setAuthErrorMsg('登录出错：' + (error.message || String(error)));
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsEditMode(false);
    } catch (error) {
      console.error('Sign Out Error:', error);
    }
  };

  const handleAdminDeleteMessage = async (messageId: string) => {
    if (isEditMode || (currentUser && currentUser.email === 'lgzj416@gmail.com')) {
      setMessageToDelete(messageId);
    }
  };

  const confirmDeleteMessage = async () => {
    if (!messageToDelete) return;
    const isSeed = messageToDelete.startsWith('seed-');
    if (isSeed) {
      const updated = [...deletedSeedIds, messageToDelete];
      setDeletedSeedIds(updated);
      try {
        localStorage.setItem('deleted_seed_message_ids', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      setMessageToDelete(null);
    } else {
      try {
        await deleteDoc(doc(db, 'messages', messageToDelete));
        setMessageToDelete(null);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `messages/${messageToDelete}`);
      }
    }
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

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const currentX = e.targetTouches[0].clientX;
    const currentY = e.targetTouches[0].clientY;
    const dx = currentX - touchStartX.current;
    const dy = currentY - touchStartY.current;

    // Small range clamp: prevent moving too far (max 40px)
    const maxOffset = 40;
    const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));
    const px = clamp(dx, -maxOffset, maxOffset);
    const py = clamp(dy, -maxOffset, maxOffset);

    setParallax({ x: px, y: py });
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

    // Elastic snap back on release
    setParallax({ x: 0, y: 0 });
  };

  // Mouse move for 3D stereoscopic parallax on desktop
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    
    // Normalized parallax multiplier: max 45px displacement in any direction
    const maxMove = 45;
    const xOffset = (dx / (rect.width / 2)) * maxMove;
    const yOffset = (dy / (rect.height / 2)) * maxMove;
    
    setParallax({ x: xOffset, y: yOffset });
  };

  const onMouseLeave = () => {
    setParallax({ x: 0, y: 0 });
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
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
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
                  opacity: layout.opacity,
                  x: parallax.x * ((shape.id % 3 + 1) * 0.15),
                  y: parallax.y * ((shape.id % 3 + 1) * 0.15)
                }}
                transition={{
                  default: {
                    type: 'spring',
                    stiffness: 75,
                    damping: 15,
                    mass: 1.05
                  },
                  x: {
                    type: 'spring',
                    stiffness: 400,
                    damping: 28,
                    mass: 0.15
                  },
                  y: {
                    type: 'spring',
                    stiffness: 400,
                    damping: 28,
                    mass: 0.15
                  }
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

            {/* Edit Mode / Admin Controls */}
            <div className="flex items-center gap-2">
              {currentUser && currentUser.email === 'lgzj416@gmail.com' && (
                <button
                  onClick={handleSignOut}
                  className="px-2.5 py-1 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider bg-black text-white border-2 border-black shadow-flat active:translate-x-0.5 active:translate-y-0.5 hover:bg-white hover:text-black transition-all cursor-pointer"
                  title="退出站长身份登录"
                >
                  🚪 登出
                </button>
              )}
              <button
                onClick={handleToggleEditMode}
                className={`px-3 py-1 text-[10px] sm:text-xs font-display font-black uppercase tracking-wider transition-all border-2 border-black shadow-flat active:translate-x-0.5 active:translate-y-0.5 ${
                  isEditMode 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-white text-black hover:bg-black hover:text-white'
                }`}
                title={isEditMode ? "保存并退出编辑" : "开启编辑模式"}
              >
                {isEditMode ? "💾 退出并保存" : "✏️ 编辑模式"}
              </button>
            </div>

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
              {/* Inner wrapper for interactive 3D stereoscopic depth */}
              <motion.div
                className="w-full h-full flex flex-col justify-between"
                animate={{
                  x: parallax.x * 0.55,
                  y: parallax.y * 0.55
                }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 28,
                  mass: 0.15
                }}
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
                        href="https://y.music.163.com/m/user?id=1679831678"
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
                            {messages.filter(msg => !deletedSeedIds.includes(msg.id)).map((msg) => (
                              <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="p-3 bg-white border-2 border-black shadow-flat flex gap-3 items-start animate-fade-in"
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
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-[9px] text-gray-500 shrink-0">
                                        {msg.time}
                                      </span>
                                      {(isEditMode || (currentUser && currentUser.email === 'lgzj416@gmail.com')) && (
                                        <button
                                          onClick={() => handleAdminDeleteMessage(msg.id)}
                                          className="flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold font-mono uppercase bg-red-100 hover:bg-red-500 hover:text-white text-red-600 border border-red-400 rounded-sm transition-all cursor-pointer shadow-flat-sm active:translate-x-[0.5px] active:translate-y-[0.5px]"
                                          title="删除此条留言"
                                        >
                                          <span>🗑️</span>
                                          <span className="hidden sm:inline">删除</span>
                                        </button>
                                      )}
                                    </div>
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
                            已显示 {messages.filter(msg => !deletedSeedIds.includes(msg.id)).length} 条留言
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              </motion.div>
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

        {/* OWNER GOOGLE AUTH MODAL */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <div className="bg-white border-4 border-black p-6 sm:p-8 max-w-sm w-full shadow-flat-lg rounded-none text-left relative animate-fade-in pointer-events-auto">
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-2 right-3 font-mono font-black text-black hover:text-red-500 text-lg cursor-pointer"
              >
                ×
              </button>
              <h3 className="font-display font-black text-xl uppercase tracking-tight text-black mb-1">
                Owner Verification
              </h3>
              <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-4">
                站长身份登录验证
              </p>
              <p className="font-sans text-xs text-black leading-relaxed mb-5">
                此网站开启了云端数据存储。开启编辑模式需要验证站长身份。请使用站长 Google 账号 (<b>lgzj416@gmail.com</b>) 登录以继续。
              </p>

              {authErrorMsg && (
                <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 text-red-700 font-sans text-xs font-bold">
                  {authErrorMsg}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleGoogleSignIn}
                  className="w-full py-3 bg-[#FCB714] text-black font-display font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-black shadow-flat hover:bg-black hover:text-white active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                >
                  🚀 使用 Google 账号登录
                </button>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="w-full py-2 bg-gray-100 text-black font-mono text-[10px] uppercase tracking-widest border-2 border-black hover:bg-gray-200 transition-all cursor-pointer"
                >
                  取消 CANCEL
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {messageToDelete !== null && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <div className="bg-white border-4 border-black p-6 sm:p-8 max-w-sm w-full shadow-flat-lg rounded-none text-left relative animate-fade-in pointer-events-auto">
              <button 
                onClick={() => setMessageToDelete(null)}
                className="absolute top-2 right-3 font-mono font-black text-black hover:text-red-500 text-lg cursor-pointer"
              >
                ×
              </button>
              <h3 className="font-display font-black text-xl uppercase tracking-tight text-black mb-1">
                Confirm Deletion
              </h3>
              <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-4">
                确认删除留言
              </p>
              <p className="font-sans text-xs text-black leading-relaxed mb-5">
                您确定要删除这条留言吗？此操作不可撤销。
              </p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={confirmDeleteMessage}
                  className="w-full py-3 bg-red-500 text-white font-display font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-black shadow-flat hover:bg-black active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                >
                  🔥 确认删除 DELETE
                </button>
                <button
                  onClick={() => setMessageToDelete(null)}
                  className="w-full py-2 bg-gray-100 text-black font-mono text-[10px] uppercase tracking-widest border-2 border-black hover:bg-gray-200 transition-all cursor-pointer"
                >
                  取消 CANCEL
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
