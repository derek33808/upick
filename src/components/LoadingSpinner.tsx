import { useApp } from '../contexts/AppContext';

interface LoadingSpinnerProps {
  connectionStatus?: 'connecting' | 'connected' | 'failed' | 'fallback';
}

export function LoadingSpinner({ connectionStatus = 'connecting' }: LoadingSpinnerProps) {
  const { language } = useApp();

  const text = {
    en: {
      loading: 'Loading...',
      subtitle: 'Getting the latest prices for you',
      syncingData: 'Syncing data to database...',
      connectionFailed: 'Database connection failed',
      usingFallback: 'Using offline data',
      retrying: 'Retrying connection...'
    },
    zh: {
      loading: '加载中...',
      subtitle: '正在为您获取最新价格',
      syncingData: '正在同步数据到数据库...',
      connectionFailed: '数据库连接失败',
      usingFallback: '使用离线数据',
      retrying: '正在重试连接...',
      timeout: '连接超时，正在切换到离线模式...',
      networkIssue: '网络连接问题，请检查网络设置'
    }
  };

  const getStatusMessage = () => {
    switch (connectionStatus) {
      case 'connecting':
        return text[language].syncingData;
      case 'failed':
        return text[language].networkIssue;
      case 'fallback':
        return text[language].usingFallback;
      default:
        return text[language].syncingData;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'failed':
        return 'text-orange-600';
      case 'fallback':
        return 'text-blue-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        {/* Logo */}
        <div className="w-16 h-16 bg-primary-500 rounded-lg flex items-center justify-center mb-6 mx-auto">
          <svg 
            width="32" 
            height="32" 
            viewBox="0 0 24 24" 
            fill="none" 
            className="text-white"
          >
            <path 
              d="M6 4v10c0 2.2 1.8 4 4 4h4c2.2 0 4-1.8 4-4V4" 
              stroke="currentColor" 
              strokeWidth="2.8" 
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>

        {/* Spinner */}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
        
        {/* Text */}
        <h2 className={`text-xl font-semibold text-gray-900 mb-2 ${language === 'zh' ? 'font-chinese' : ''}`}>
          {text[language].loading}
        </h2>
        <p className={`text-gray-600 ${language === 'zh' ? 'font-chinese' : ''}`}>
          {text[language].subtitle}
        </p>
        
        {/* Sync status hint */}
        <div className={`mt-4 text-sm ${getStatusColor()}`}>
          <p className={language === 'zh' ? 'font-chinese' : ''}>
            {getStatusMessage()}
          </p>
          {connectionStatus === 'fallback' && (
            <p className={`text-xs mt-1 text-gray-400 ${language === 'zh' ? 'font-chinese' : ''}`}>
              {language === 'en' ? 'Check your network connection' : '请检查网络连接'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}