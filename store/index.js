import { proxy } from 'valtio';

// page: ۰ = کتابِ بسته، ۱ تا ۴ = چهار پاپ‌آپ، ۵ = صفحه‌ی پایانی
const state = proxy({ page: 0, sound: true, ready: false });
export const LAST_PAGE = 5;
export default state;
