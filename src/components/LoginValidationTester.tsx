import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Shield, Database, User, Key } from 'lucide-react';

interface ValidationResult {
  isValid: boolean;
  details: {
    authUser: any;
    dbUser: any;
    session: any;
    authState: any;
    supabaseConnection: boolean;
    databaseConnection: boolean;
    authModuleWorking: boolean;
    errors: string[];
  };
}

export function LoginValidationTester() {
  const { validateLoginStatus } = useAuth();
  const { language } = useApp();
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const text = {
    en: {
      title: 'Login Module Validation',
      validateButton: 'Validate Login Module',
      validating: 'Validating...',
      valid: 'Valid',
      invalid: 'Invalid',
      warning: 'Warning',
      supabaseConnection: 'Supabase Connection',
      databaseConnection: 'Database Connection',
      authModule: 'Authentication Module',
      currentSession: 'Current Session',
      authUser: 'Authenticated User',
      dbUser: 'Database User Profile',
      errors: 'Errors',
      noErrors: 'No errors found',
      connectionOk: 'Connection OK',
      connectionFailed: 'Connection Failed',
      sessionActive: 'Session Active',
      sessionNone: 'No Active Session',
      userFound: 'User Found',
      userNotFound: 'User Not Found',
      profileFound: 'Profile Found',
      profileNotFound: 'Profile Not Found',
      moduleWorking: 'Module Working',
      moduleIssues: 'Module Has Issues',
      overallStatus: 'Overall Status',
      details: 'Details',
      retry: 'Retry Validation'
    },
    zh: {
      title: '登录模块验证',
      validateButton: '验证登录模块',
      validating: '验证中...',
      valid: '正常',
      invalid: '异常',
      warning: '警告',
      supabaseConnection: 'Supabase连接',
      databaseConnection: '数据库连接',
      authModule: '认证模块',
      currentSession: '当前会话',
      authUser: '认证用户',
      dbUser: '数据库用户资料',
      errors: '错误',
      noErrors: '未发现错误',
      connectionOk: '连接正常',
      connectionFailed: '连接失败',
      sessionActive: '会话活跃',
      sessionNone: '无活跃会话',
      userFound: '找到用户',
      userNotFound: '未找到用户',
      profileFound: '找到资料',
      profileNotFound: '未找到资料',
      moduleWorking: '模块正常',
      moduleIssues: '模块有问题',
      overallStatus: '整体状态',
      details: '详细信息',
      retry: '重新验证'
    }
  };

  const handleValidate = async () => {
    setIsValidating(true);
    try {
      const result = await validateLoginStatus();
      setValidationResult(result);
    } catch (error) {
      console.error('Validation error:', error);
      setValidationResult({
        isValid: false,
        details: {
          authUser: null,
          dbUser: null,
          session: null,
          authState: null,
          supabaseConnection: false,
          databaseConnection: false,
          authModuleWorking: false,
          errors: [`Validation failed: ${error}`]
        }
      });
    } finally {
      setIsValidating(false);
    }
  };

  const StatusIcon = ({ isValid, isWarning }: { isValid: boolean; isWarning?: boolean }) => {
    if (isWarning) return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    return isValid ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />;
  };

  const StatusText = ({ isValid, isWarning, validText, invalidText, warningText }: {
    isValid: boolean;
    isWarning?: boolean;
    validText: string;
    invalidText: string;
    warningText?: string;
  }) => {
    const className = isWarning ? 'text-yellow-600' : isValid ? 'text-green-600' : 'text-red-600';
    const text = isWarning ? warningText : isValid ? validText : invalidText;
    return <span className={`font-medium ${className}`}>{text}</span>;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Shield className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">{text[language].title}</h2>
        </div>
        <button
          onClick={handleValidate}
          disabled={isValidating}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isValidating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{text[language].validating}</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>{text[language].validateButton}</span>
            </>
          )}
        </button>
      </div>

      {validationResult && (
        <div className="space-y-6">
          {/* Overall Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <StatusIcon isValid={validationResult.isValid} />
                <span className="text-lg font-semibold text-gray-900">{text[language].overallStatus}</span>
              </div>
              <StatusText
                isValid={validationResult.isValid}
                validText={text[language].valid}
                invalidText={text[language].invalid}
              />
            </div>
          </div>

          {/* Validation Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Supabase Connection */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">{text[language].supabaseConnection}</span>
                </div>
                <StatusIcon isValid={validationResult.details.supabaseConnection} />
              </div>
              <StatusText
                isValid={validationResult.details.supabaseConnection}
                validText={text[language].connectionOk}
                invalidText={text[language].connectionFailed}
              />
            </div>

            {/* Database Connection */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-900">{text[language].databaseConnection}</span>
                </div>
                <StatusIcon isValid={validationResult.details.databaseConnection} />
              </div>
              <StatusText
                isValid={validationResult.details.databaseConnection}
                validText={text[language].connectionOk}
                invalidText={text[language].connectionFailed}
              />
            </div>

            {/* Auth Module */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Key className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-900">{text[language].authModule}</span>
                </div>
                <StatusIcon isValid={validationResult.details.authModuleWorking} />
              </div>
              <StatusText
                isValid={validationResult.details.authModuleWorking}
                validText={text[language].moduleWorking}
                invalidText={text[language].moduleIssues}
              />
            </div>

            {/* Current Session */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-gray-900">{text[language].currentSession}</span>
                </div>
                <StatusIcon isValid={!!validationResult.details.session} isWarning={!validationResult.details.session} />
              </div>
              <div className="text-sm text-gray-600">
                {validationResult.details.session ? (
                  <div>
                    <div>{text[language].sessionActive}</div>
                    <div className="text-xs mt-1">
                      User: {validationResult.details.session.email}<br />
                      Expires: {new Date(validationResult.details.session.expiresAt * 1000).toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <span>{text[language].sessionNone}</span>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Auth User */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">{text[language].authUser}</h3>
              {validationResult.details.authUser ? (
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Email:</span> {validationResult.details.authUser.email}</div>
                  <div><span className="font-medium">ID:</span> {validationResult.details.authUser.id}</div>
                  <div><span className="font-medium">Email Confirmed:</span> {validationResult.details.authUser.emailConfirmed ? 'Yes' : 'No'}</div>
                  <div><span className="font-medium">Created:</span> {new Date(validationResult.details.authUser.createdAt).toLocaleString()}</div>
                </div>
              ) : (
                <span className="text-gray-500">{text[language].userNotFound}</span>
              )}
            </div>

            {/* DB User */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">{text[language].dbUser}</h3>
              {validationResult.details.dbUser ? (
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Name:</span> {validationResult.details.dbUser.name}</div>
                  <div><span className="font-medium">Email:</span> {validationResult.details.dbUser.email}</div>
                  <div><span className="font-medium">Region:</span> {validationResult.details.dbUser.region}</div>
                  <div><span className="font-medium">Language:</span> {validationResult.details.dbUser.language}</div>
                </div>
              ) : (
                <span className="text-gray-500">{text[language].profileNotFound}</span>
              )}
            </div>
          </div>

          {/* Errors */}
          {validationResult.details.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-medium text-red-900 mb-3">{text[language].errors}</h3>
              <ul className="space-y-2 text-sm text-red-700">
                {validationResult.details.errors.map((error, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {validationResult.details.errors.length === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">{text[language].noErrors}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


