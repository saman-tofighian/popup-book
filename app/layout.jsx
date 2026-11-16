import 'vazirmatn/Vazirmatn-Variable-font-face.css';
import './globals.css';

export const metadata = {
  title: 'سامان توفیقیان',
  description:
    'یک کتابِ پاپ‌آپِ سه‌بعدی: ورق بزن و ببین جنگل، شهر، دریا و فضا از دلِ کاغذ بالا میاد.',
  openGraph: {
    title: 'سفرِ کاغذی 📖',
    description: 'کتابِ پاپ‌آپِ سه‌بعدیِ فارسی',
    type: 'website',
    locale: 'fa_IR',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#241F33',
};

export default function RootLayout({ children }) {
  return (
    <html lang='fa' dir='rtl'>
      <body className='font-sans antialiased'>{children}</body>
    </html>
  );
}
