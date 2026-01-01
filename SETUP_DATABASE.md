# إعداد قاعدة البيانات - مهووس برو

## خطوات إنشاء الجداول المطلوبة في Supabase

### 1. افتح SQL Editor في Supabase
اذهب إلى: https://supabase.com/dashboard/project/euouewrasvuwdapcxdcs/sql/new

### 2. انسخ والصق الكود التالي ثم اضغط Run

```sql
-- إنشاء جدول assets لإدارة الأصول والعهد
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  accepted_at TIMESTAMP WITH TIME ZONE,
  accepted_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول system_logs للصندوق الأسود والرقابة
CREATE TABLE IF NOT EXISTS public.system_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL CHECK (user_role IN ('admin', 'employee')),
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول supplier_ledger لدفتر ديون الموردين
CREATE TABLE IF NOT EXISTS public.supplier_ledger (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_name TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  order_number TEXT,
  closed_by TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE
);

-- إنشاء جدول categories لفئات المصروفات
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول expenses لإدارة المصروفات
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  type TEXT,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_by TEXT,
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  employee_balance_transaction_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء indexes لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_assets_status ON public.assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_created_at ON public.assets(created_at);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON public.system_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_name ON public.system_logs(user_name);
CREATE INDEX IF NOT EXISTS idx_supplier_ledger_status ON public.supplier_ledger(status);
CREATE INDEX IF NOT EXISTS idx_supplier_ledger_supplier_name ON public.supplier_ledger(supplier_name);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON public.expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_categories_name ON public.categories(name);

-- إنشاء trigger لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_assets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assets_updated_at_trigger
BEFORE UPDATE ON public.assets
FOR EACH ROW
EXECUTE FUNCTION update_assets_updated_at();

-- إنشاء trigger لتحديث updated_at تلقائياً لجدول expenses
CREATE OR REPLACE FUNCTION update_expenses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER expenses_updated_at_trigger
BEFORE UPDATE ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION update_expenses_updated_at();
```

### 3. تأكد من نجاح التنفيذ
يجب أن ترى رسالة "Success" في نافذة النتائج.

### 4. جاهز للاستخدام! 🎉
الآن يمكنك استخدام جميع ميزات مهووس برو:
- ✅ إدارة الأصول والعهد
- ✅ الصندوق الأسود (سجل الأحداث)
- ✅ دفتر ديون الموردين
- ✅ إدارة المصروفات والفئات
- ✅ نظام الصلاحيات (مدير/موظف)
- ✅ PWA - يعمل بدون إنترنت
- ✅ رسوم بيانية تفاعلية
- ✅ تصدير Excel

## ملاحظات مهمة
- جميع الجداول تستخدم UUID كمفتاح أساسي
- جميع التواريخ مخزنة بتوقيت UTC
- الـ Indexes تحسن الأداء بشكل كبير
- الـ Triggers تعمل تلقائياً

## إصلاح خطأ "Could not find the 'status' column"

إذا واجهت خطأ يقول `Could not find the 'status' column of 'expenses' in the schema cache`، فهذا يعني أن جدول `expenses` في قاعدة البيانات لا يحتوي على عمود `status` والأعمدة المرتبطة به.

### الحل: تشغيل Migration

1. افتح SQL Editor في Supabase
2. افتح ملف `migration_add_status_to_expenses.sql`
3. انسخ محتوى الملف بالكامل والصقه في SQL Editor
4. اضغط Run
5. تأكد من ظهور رسائل النجاح
6. قم بتحديث صفحة التطبيق (Refresh)

هذا الـ Migration سيضيف الأعمدة التالية إلى جدول `expenses` إذا لم تكن موجودة:
- `status` - حالة المصروف (pending, approved, rejected)
- `approved_by` - من قام بالموافقة
- `approved_at` - تاريخ الموافقة
- `employee_balance_transaction_id` - ربط مع معاملة العهدة

## دعم
للمساعدة أو الاستفسارات، تواصل معنا.
