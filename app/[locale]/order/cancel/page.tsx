export default function OrderCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center space-y-4">
        <div className="text-5xl">😔</div>
        <h1 className="text-2xl font-semibold text-gray-900">订单已取消</h1>
        <p className="text-gray-600">
          Your order was cancelled. If this was a mistake, you can resume shopping and try checking out again.
        </p>
        <a
          href="/cart"
          className="inline-block mt-4 px-6 py-3 rounded-lg bg-[#2E7D32] text-white font-semibold hover:bg-[#256628] transition"
        >
          Return to Cart
        </a>
      </div>
    </div>
  );
}

