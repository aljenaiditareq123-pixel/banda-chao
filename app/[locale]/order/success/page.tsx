export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center space-y-4">
        <div className="text-5xl">🎉</div>
        <h1 className="text-2xl font-semibold text-gray-900">谢谢您的订单！</h1>
        <p className="text-gray-600">
          Thank you for your order! We&rsquo;re processing your payment and will send you an update when your items are on the way.
        </p>
        <a
          href="/"
          className="inline-block mt-4 px-6 py-3 rounded-lg bg-[#2E7D32] text-white font-semibold hover:bg-[#256628] transition"
        >
          Continue Shopping
        </a>
      </div>
    </div>
  );
}

