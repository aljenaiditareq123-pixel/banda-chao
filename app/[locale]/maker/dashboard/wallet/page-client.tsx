'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import MakerLayout from '@/components/maker/MakerLayout';
import LoadingState from '@/components/common/LoadingState';
import { Wallet, TrendingUp, DollarSign, Percent, X, ArrowDown } from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';
import apiClient from '@/lib/api';

interface MakerWalletClientProps {
  locale: string;
}

interface WalletStats {
  totalSales: number;
  totalPlatformFees: number;
  totalNetEarnings: number;
  currency: string;
}

interface Transaction {
  orderId: string;
  orderDate: string;
  productPrice: number;
  platformFee: number;
  netEarnings: number;
  currency: string;
  status: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
}

export default function MakerWalletClient({ locale }: MakerWalletClientProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<WalletStats>({
    totalSales: 0,
    totalPlatformFees: 0,
    totalNetEarnings: 0,
    currency: 'USD',
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutError, setPayoutError] = useState('');
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push(`/${locale}/auth/login`);
        return;
      }
      if (user.role !== 'MAKER') {
        router.push(`/${locale}/maker/join`);
        return;
      }
    }
  }, [user, authLoading, locale, router]);

  useEffect(() => {
    if (user && user.role === 'MAKER') {
      fetchWalletData();
    }
  }, [user]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/orders/maker/wallet');
      if (response.data.success) {
        setStats(response.data.stats);
        setTransactions(response.data.transactions || []);
      }
    } catch (error: any) {
      console.error('Error fetching wallet data:', error);
      // Set empty data on error
      setStats({
        totalSales: 0,
        totalPlatformFees: 0,
        totalNetEarnings: 0,
        currency: 'USD',
      });
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <LoadingState fullScreen />
      </div>
    );
  }

  if (!user || user.role !== 'MAKER') {
    return null;
  }

  const makerName = user.name || user.email?.split('@')[0] || 'Master Artisan';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : locale === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <MakerLayout locale={locale} makerName={makerName}>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 mb-2">
            {locale === 'ar' ? 'المحفظة' : locale === 'zh' ? '钱包' : 'Wallet'}
          </h1>
          <p className="text-gray-400">
            {locale === 'ar'
              ? 'عرض بياناتك المالية وإجمالي المبيعات والعمولات'
              : locale === 'zh'
              ? '查看您的财务数据、总销售额和佣金'
              : 'View your financial data, total sales, and commissions'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Sales Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-amber-500/20 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl">
                <DollarSign className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <h3 className="text-gray-400 text-sm mb-2">
              {locale === 'ar' ? 'إجمالي المبيعات' : locale === 'zh' ? '总销售额' : 'Total Sales'}
            </h3>
            <p className="text-3xl font-bold text-white mb-1">
              {formatCurrency(stats.totalSales, stats.currency, locale)}
            </p>
            <p className="text-xs text-gray-500">
              {locale === 'ar'
                ? 'إجمالي قيمة المنتجات المباعة'
                : locale === 'zh'
                ? '售出产品的总价值'
                : 'Total value of products sold'}
            </p>
          </div>

          {/* Platform Fees Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-amber-500/20 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl">
                <Percent className="w-6 h-6 text-red-400" />
              </div>
            </div>
            <h3 className="text-gray-400 text-sm mb-2">
              {locale === 'ar'
                ? 'عمولة المنصة'
                : locale === 'zh'
                ? '平台佣金'
                : 'Platform Fees'}
            </h3>
            <p className="text-3xl font-bold text-white mb-1">
              {formatCurrency(stats.totalPlatformFees, stats.currency, locale)}
            </p>
            <p className="text-xs text-gray-500">
              {locale === 'ar'
                ? '5% من المبيعات للمنصة'
                : locale === 'zh'
                ? '平台销售额的5%'
                : '5% commission to platform'}
            </p>
          </div>

          {/* Net Earnings Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-amber-500/20 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <h3 className="text-gray-400 text-sm mb-2">
              {locale === 'ar' ? 'صافي الأرباح' : locale === 'zh' ? '净收益' : 'Net Earnings'}
            </h3>
            <p className="text-3xl font-bold text-white mb-1">
              {formatCurrency(stats.totalNetEarnings, stats.currency, locale)}
            </p>
            <p className="text-xs text-gray-500 mb-4">
              {locale === 'ar'
                ? 'المبلغ المتاح للتاجر (95%)'
                : locale === 'zh'
                ? '商家可用金额 (95%)'
                : 'Available to seller (95%)'}
            </p>
            <button
              onClick={() => setShowPayoutModal(true)}
              disabled={stats.totalNetEarnings <= 0}
              className={`w-full py-2 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                stats.totalNetEarnings > 0
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ArrowDown className="w-4 h-4" />
              <span>{locale === 'ar' ? 'طلب سحب' : locale === 'zh' ? '申请提现' : 'Request Payout'}</span>
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-amber-500/20 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-amber-500/20">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Wallet className="w-6 h-6 text-amber-400" />
              {locale === 'ar'
                ? 'سجل المعاملات'
                : locale === 'zh'
                ? '交易记录'
                : 'Transaction History'}
            </h2>
          </div>

          {transactions.length === 0 ? (
            <div className="p-12 text-center">
              <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">
                {locale === 'ar'
                  ? 'لا توجد معاملات حتى الآن'
                  : locale === 'zh'
                  ? '目前没有交易'
                  : 'No transactions yet'}
              </p>
              <p className="text-gray-500 text-sm">
                {locale === 'ar'
                  ? 'ستظهر معاملاتك هنا بعد إتمام أول عملية بيع'
                  : locale === 'zh'
                  ? '您的交易将在首次销售后显示在这里'
                  : 'Your transactions will appear here after your first sale'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50 border-b border-amber-500/20">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">
                      {locale === 'ar' ? 'رقم الطلب' : locale === 'zh' ? '订单号' : 'Order ID'}
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">
                      {locale === 'ar' ? 'التاريخ' : locale === 'zh' ? '日期' : 'Date'}
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">
                      {locale === 'ar' ? 'سعر المنتج' : locale === 'zh' ? '产品价格' : 'Product Price'}
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">
                      {locale === 'ar' ? 'العمولة (5%)' : locale === 'zh' ? '佣金 (5%)' : 'Commission (5%)'}
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">
                      {locale === 'ar' ? 'المبلغ الصافي' : locale === 'zh' ? '净额' : 'Net Amount'}
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">
                      {locale === 'ar' ? 'الحالة' : locale === 'zh' ? '状态' : 'Status'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-500/10">
                  {transactions.map((transaction) => (
                    <tr key={transaction.orderId} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-300 font-mono">
                        {transaction.orderId.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {formatDate(transaction.orderDate)}
                      </td>
                      <td className="px-6 py-4 text-sm text-white font-medium">
                        {formatCurrency(transaction.productPrice, transaction.currency, locale)}
                      </td>
                      <td className="px-6 py-4 text-sm text-red-400">
                        -{formatCurrency(transaction.platformFee, transaction.currency, locale)}
                      </td>
                      <td className="px-6 py-4 text-sm text-green-400 font-semibold">
                        {formatCurrency(transaction.netEarnings, transaction.currency, locale)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            transaction.status === 'PAID'
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : transaction.status === 'PENDING'
                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                          }`}
                        >
                          {transaction.status === 'PAID'
                            ? locale === 'ar'
                              ? 'مدفوع'
                              : locale === 'zh'
                              ? '已支付'
                              : 'Paid'
                            : transaction.status === 'PENDING'
                            ? locale === 'ar'
                              ? 'قيد الانتظار'
                              : locale === 'zh'
                              ? '待处理'
                              : 'Pending'
                            : transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payout Request Modal */}
        {showPayoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-amber-500/20 shadow-2xl max-w-md w-full mx-4 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {locale === 'ar' ? 'طلب سحب الأرباح' : locale === 'zh' ? '申请提现' : 'Request Payout'}
                </h2>
                <button
                  onClick={() => {
                    setShowPayoutModal(false);
                    setPayoutError('');
                    setPayoutSuccess(false);
                    setPayoutAmount('');
                    setBankName('');
                    setAccountNumber('');
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {payoutSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {locale === 'ar' ? 'تم إرسال الطلب بنجاح!' : locale === 'zh' ? '申请已提交！' : 'Request Submitted!'}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {locale === 'ar'
                      ? 'سيتم مراجعة طلبك وسيتلقى معالجة في أقرب وقت ممكن'
                      : locale === 'zh'
                      ? '您的申请将被审核并尽快处理'
                      : 'Your request will be reviewed and processed as soon as possible'}
                  </p>
                  <button
                    onClick={() => {
                      setShowPayoutModal(false);
                      setPayoutSuccess(false);
                      setPayoutAmount('');
                      setBankName('');
                      setAccountNumber('');
                      fetchWalletData();
                    }}
                    className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold transition-all duration-200"
                  >
                    {locale === 'ar' ? 'حسناً' : locale === 'zh' ? '好的' : 'OK'}
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!payoutAmount || !bankName || !accountNumber) {
                      setPayoutError(
                        locale === 'ar'
                          ? 'يرجى ملء جميع الحقول'
                          : locale === 'zh'
                          ? '请填写所有字段'
                          : 'Please fill all fields'
                      );
                      return;
                    }

                    const amount = parseFloat(payoutAmount);
                    if (isNaN(amount) || amount <= 0) {
                      setPayoutError(
                        locale === 'ar'
                          ? 'يرجى إدخال مبلغ صحيح'
                          : locale === 'zh'
                          ? '请输入有效金额'
                          : 'Please enter a valid amount'
                      );
                      return;
                    }

                    if (amount > stats.totalNetEarnings) {
                      setPayoutError(
                        locale === 'ar'
                          ? `المبلغ المطلوب (${formatCurrency(amount, stats.currency, locale)}) يتجاوز الرصيد المتاح (${formatCurrency(stats.totalNetEarnings, stats.currency, locale)})`
                          : locale === 'zh'
                          ? `请求金额 (${formatCurrency(amount, stats.currency, locale)}) 超过可用余额 (${formatCurrency(stats.totalNetEarnings, stats.currency, locale)})`
                          : `Requested amount (${formatCurrency(amount, stats.currency, locale)}) exceeds available balance (${formatCurrency(stats.totalNetEarnings, stats.currency, locale)})`
                      );
                      return;
                    }

                    try {
                      setPayoutLoading(true);
                      setPayoutError('');
                      const response = await apiClient.post('/orders/maker/payout', {
                        amount: amount,
                        bankName: bankName.trim(),
                        accountNumber: accountNumber.trim(),
                        currency: stats.currency,
                      });

                      if (response.data.success) {
                        setPayoutSuccess(true);
                      } else {
                        setPayoutError(response.data.message || 'Failed to submit payout request');
                      }
                    } catch (error: any) {
                      console.error('Error submitting payout request:', error);
                      const errorMessage =
                        error.response?.data?.message ||
                        (locale === 'ar'
                          ? 'فشل في إرسال طلب السحب. يرجى المحاولة مرة أخرى'
                          : locale === 'zh'
                          ? '提现申请提交失败。请重试'
                          : 'Failed to submit payout request. Please try again');
                      setPayoutError(errorMessage);
                    } finally {
                      setPayoutLoading(false);
                    }
                  }}
                >
                  <div className="space-y-4">
                    {/* Available Balance */}
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-sm text-gray-400 mb-1">
                        {locale === 'ar' ? 'الرصيد المتاح' : locale === 'zh' ? '可用余额' : 'Available Balance'}
                      </p>
                      <p className="text-2xl font-bold text-green-400">
                        {formatCurrency(stats.totalNetEarnings, stats.currency, locale)}
                      </p>
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {locale === 'ar' ? 'المبلغ المطلوب سحبه' : locale === 'zh' ? '提现金额' : 'Amount'}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={stats.totalNetEarnings}
                        value={payoutAmount}
                        onChange={(e) => setPayoutAmount(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                        placeholder="0.00"
                        required
                      />
                    </div>

                    {/* Bank Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {locale === 'ar' ? 'اسم البنك' : locale === 'zh' ? '银行名称' : 'Bank Name'}
                      </label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                        placeholder={locale === 'ar' ? 'أدخل اسم البنك' : locale === 'zh' ? '输入银行名称' : 'Enter bank name'}
                        required
                      />
                    </div>

                    {/* Account Number / IBAN */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {locale === 'ar' ? 'رقم الحساب أو الآيبان' : locale === 'zh' ? '账号或IBAN' : 'Account Number or IBAN'}
                      </label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                        placeholder={locale === 'ar' ? 'أدخل رقم الحساب أو الآيبان' : locale === 'zh' ? '输入账号或IBAN' : 'Enter account number or IBAN'}
                        required
                      />
                    </div>

                    {/* Error Message */}
                    {payoutError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-sm text-red-400">{payoutError}</p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPayoutModal(false);
                          setPayoutError('');
                          setPayoutAmount('');
                          setBankName('');
                          setAccountNumber('');
                        }}
                        className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all duration-200"
                        disabled={payoutLoading}
                      >
                        {locale === 'ar' ? 'إلغاء' : locale === 'zh' ? '取消' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        disabled={payoutLoading || !payoutAmount || !bankName || !accountNumber}
                        className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                          payoutLoading || !payoutAmount || !bankName || !accountNumber
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black'
                        }`}
                      >
                        {payoutLoading
                          ? locale === 'ar'
                            ? 'جاري الإرسال...'
                            : locale === 'zh'
                            ? '提交中...'
                            : 'Submitting...'
                          : locale === 'ar'
                          ? 'إرسال الطلب'
                          : locale === 'zh'
                          ? '提交申请'
                          : 'Submit Request'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </MakerLayout>
  );
}
