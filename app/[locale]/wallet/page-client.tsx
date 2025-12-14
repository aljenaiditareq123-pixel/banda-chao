'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowUpDown, ArrowDown, ArrowUp, History, Gift, CreditCard, TrendingUp } from 'lucide-react';
import { walletAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import confetti from 'canvas-confetti';

interface WalletPageClientProps {
  locale: string;
}

interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'POINTS_CONVERSION' | 'GAME_REWARD' | 'PURCHASE' | 'REFUND';
  amount: number;
  currency: string;
  description: string;
  relatedOrderId?: string;
  createdAt: string;
}

export default function WalletPageClient({ locale }: WalletPageClientProps) {
  const { user } = useAuth();
  const [balance, setBalance] = useState<{ balance: number; points: number; currency: string } | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<{ totalEarned: number; totalSpent: number; totalTransactions: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [pointsToConvert, setPointsToConvert] = useState('');
  const [showConvertModal, setShowConvertModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadWalletData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadWalletData = async () => {
    try {
      const [balanceRes, transactionsRes, statsRes] = await Promise.all([
        walletAPI.getBalance(),
        walletAPI.getTransactions(),
        walletAPI.getStats(),
      ]);

      if (balanceRes.success) {
        setBalance({
          balance: balanceRes.balance || 0,
          points: balanceRes.points || 0,
          currency: balanceRes.currency || 'USD',
        });
      }

      if (transactionsRes.success) {
        setTransactions(transactionsRes.transactions || []);
      }

      if (statsRes.success) {
        setStats({
          totalEarned: statsRes.totalEarned || 0,
          totalSpent: statsRes.totalSpent || 0,
          totalTransactions: statsRes.totalTransactions || 0,
        });
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConvertPoints = async () => {
    if (!pointsToConvert || parseInt(pointsToConvert) < 100) {
      alert(
        locale === 'ar'
          ? 'الحد الأدنى للتحويل هو 100 نقطة'
          : locale === 'zh'
          ? '最低转换金额为 100 积分'
          : 'Minimum 100 points required for conversion'
      );
      return;
    }

    setConverting(true);
    try {
      const response = await walletAPI.convertPoints(parseInt(pointsToConvert));
      if (response.success) {
        // Celebrate!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        // Reload data
        await loadWalletData();
        setShowConvertModal(false);
        setPointsToConvert('');

        alert(
          locale === 'ar'
            ? `تم تحويل ${pointsToConvert} نقطة إلى ${response.balanceAdded} ${response.newBalance?.currency || 'USD'}`
            : locale === 'zh'
            ? `已将 ${pointsToConvert} 积分转换为 ${response.balanceAdded} ${response.newBalance?.currency || 'USD'}`
            : `Converted ${pointsToConvert} points to ${response.balanceAdded} ${response.newBalance?.currency || 'USD'}`
        );
      } else {
        alert(response.error || (locale === 'ar' ? 'حدث خطأ' : locale === 'zh' ? '出错了' : 'Error occurred'));
      }
    } catch (error) {
      console.error('Error converting points:', error);
      alert(locale === 'ar' ? 'حدث خطأ' : locale === 'zh' ? '出错了' : 'Error occurred');
    } finally {
      setConverting(false);
    }
  };

  const formatPrice = (amount: number, currency: string = 'USD') => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      CNY: '¥',
      SAR: 'ر.س',
      AED: 'د.إ',
    };
    return `${symbols[currency] || currency} ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : locale === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'DEPOSIT':
      case 'GAME_REWARD':
      case 'REFUND':
      case 'POINTS_CONVERSION':
        return <ArrowDown className="w-5 h-5 text-green-500" />;
      case 'WITHDRAWAL':
      case 'PURCHASE':
        return <ArrowUp className="w-5 h-5 text-red-500" />;
      default:
        return <History className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTransactionColor = (type: Transaction['type']) => {
    switch (type) {
      case 'DEPOSIT':
      case 'GAME_REWARD':
      case 'REFUND':
      case 'POINTS_CONVERSION':
        return 'text-green-600 dark:text-green-400';
      case 'WITHDRAWAL':
      case 'PURCHASE':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {locale === 'ar'
              ? 'يرجى تسجيل الدخول للوصول إلى المحفظة'
              : locale === 'zh'
              ? '请登录以访问钱包'
              : 'Please log in to access wallet'}
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {locale === 'ar' ? 'جاري التحميل...' : locale === 'zh' ? '加载中...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4"
          >
            <Wallet className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {locale === 'ar' ? 'المحفظة الرقمية' : locale === 'zh' ? '数字钱包' : 'Digital Wallet'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {locale === 'ar'
              ? 'إدارة رصيدك ونقاطك'
              : locale === 'zh'
              ? '管理您的余额和积分'
              : 'Manage your balance and points'}
          </p>
        </div>

        {/* Digital Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8"
        >
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl overflow-hidden">
            {/* Card Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px)`
              }}></div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-white/80 text-sm mb-1">
                    {locale === 'ar' ? 'الرصيد الحالي' : locale === 'zh' ? '当前余额' : 'Current Balance'}
                  </p>
                  <p className="text-4xl font-bold">
                    {balance ? formatPrice(balance.balance, balance.currency) : formatPrice(0)}
                  </p>
                </div>
                <CreditCard className="w-12 h-12 text-white/80" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm mb-1">
                    {locale === 'ar' ? 'النقاط' : locale === 'zh' ? '积分' : 'Points'}
                  </p>
                  <p className="text-2xl font-semibold">
                    {balance?.points.toLocaleString() || 0}
                  </p>
                </div>
                {balance && balance.points >= 100 && (
                  <button
                    onClick={() => setShowConvertModal(true)}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors flex items-center gap-2"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                    <span className="text-sm font-semibold">
                      {locale === 'ar' ? 'تحويل' : locale === 'zh' ? '转换' : 'Convert'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {locale === 'ar' ? 'إجمالي المكتسب' : locale === 'zh' ? '总收入' : 'Total Earned'}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(stats.totalEarned, balance?.currency || 'USD')}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <ArrowUp className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {locale === 'ar' ? 'إجمالي المصروف' : locale === 'zh' ? '总支出' : 'Total Spent'}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(stats.totalSpent, balance?.currency || 'USD')}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <History className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {locale === 'ar' ? 'المعاملات' : locale === 'zh' ? '交易' : 'Transactions'}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {stats.totalTransactions}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {locale === 'ar' ? 'سجل المعاملات' : locale === 'zh' ? '交易记录' : 'Transaction History'}
            </h2>
          </div>

          {transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white dark:bg-gray-600 rounded-full flex items-center justify-center">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === 'WITHDRAWAL' || transaction.type === 'PURCHASE'
                        ? '-'
                        : '+'}
                      {formatPrice(transaction.amount, transaction.currency)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {transaction.type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {locale === 'ar'
                  ? 'لا توجد معاملات حتى الآن'
                  : locale === 'zh'
                  ? '暂无交易记录'
                  : 'No transactions yet'}
              </p>
            </div>
          )}
        </motion.div>

        {/* Convert Points Modal */}
        {showConvertModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {locale === 'ar' ? 'تحويل النقاط' : locale === 'zh' ? '转换积分' : 'Convert Points'}
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {locale === 'ar' ? 'عدد النقاط' : locale === 'zh' ? '积分数量' : 'Points Amount'}
                </label>
                <input
                  type="number"
                  value={pointsToConvert}
                  onChange={(e) => setPointsToConvert(e.target.value)}
                  placeholder="100"
                  min="100"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {locale === 'ar'
                    ? '100 نقطة = $1 (الحد الأدنى: 100 نقطة)'
                    : locale === 'zh'
                    ? '100 积分 = $1（最低：100 积分）'
                    : '100 points = $1 (Minimum: 100 points)'}
                </p>
                {pointsToConvert && parseInt(pointsToConvert) >= 100 && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                    {locale === 'ar'
                      ? `ستحصل على: ${formatPrice(parseInt(pointsToConvert) / 100, balance?.currency || 'USD')}`
                      : locale === 'zh'
                      ? `您将获得：${formatPrice(parseInt(pointsToConvert) / 100, balance?.currency || 'USD')}`
                      : `You will get: ${formatPrice(parseInt(pointsToConvert) / 100, balance?.currency || 'USD')}`}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConvertModal(false);
                    setPointsToConvert('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {locale === 'ar' ? 'إلغاء' : locale === 'zh' ? '取消' : 'Cancel'}
                </button>
                <button
                  onClick={handleConvertPoints}
                  disabled={converting || !pointsToConvert || parseInt(pointsToConvert) < 100}
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {converting
                    ? locale === 'ar'
                      ? 'جاري التحويل...'
                      : locale === 'zh'
                      ? '正在转换...'
                      : 'Converting...'
                    : locale === 'ar'
                    ? 'تحويل'
                    : locale === 'zh'
                    ? '转换'
                    : 'Convert'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
