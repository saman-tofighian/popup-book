'use client';

import { Component } from 'react';

export function Fallback() {
  return (
    <div className="flex flex-col justify-center items-center gap-3 px-6 w-full h-full text-center">
      <span className="text-6xl">📖</span>
      <p className="font-bold text-paper text-lg">نمایش سه‌بعدی روی این دستگاه فعال نشد</p>
      <p className="max-w-sm text-paper/60 text-sm leading-7">
        مرورگر شما از WebGL پشتیبانی نمی‌کند یا غیرفعال است. لطفاً مرورگر را به‌روزرسانی کنید یا شتاب‌دهی سخت‌افزاری را فعال کنید.
      </p>
    </div>
  );
}

export default class CanvasBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('3D scene error:', error);
  }

  render() {
    return this.state.hasError ? <Fallback /> : this.props.children;
  }
}
