import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageText } from "@/components/ui/language-text";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              <LanguageText
                en="Terms of Service"
                bn="সেবার শর্তাবলী"
                ar="شروط الخدمة"
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold mb-3">
                  <LanguageText
                    en="Acceptance of Terms"
                    bn="শর্তাবলী গ্রহণ"
                    ar="قبول الشروط"
                  />
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  <LanguageText
                    en="By using this educational management system, you agree to comply with these terms of service and all applicable laws and regulations."
                    bn="এই শিক্ষা ব্যবস্থাপনা সিস্টেম ব্যবহার করে, আপনি এই সেবার শর্তাবলী এবং সমস্ত প্রযোজ্য আইন ও নিয়মাবলী মেনে চলতে সম্মত হচ্ছেন।"
                    ar="باستخدام نظام إدارة التعليم هذا، فإنك توافق على الامتثال لشروط الخدمة هذه وجميع القوانين واللوائح المعمول بها."
                  />
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">
                  <LanguageText
                    en="User Responsibilities"
                    bn="ব্যবহারকারীর দায়িত্ব"
                    ar="مسؤوليات المستخدم"
                  />
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  <LanguageText
                    en="Users are responsible for maintaining the confidentiality of their account credentials and for all activities that occur under their account."
                    bn="ব্যবহারকারীরা তাদের অ্যাকাউন্টের পরিচয়পত্রের গোপনীয়তা বজায় রাখতে এবং তাদের অ্যাকাউন্টের অধীনে ঘটা সমস্ত কার্যকলাপের জন্য দায়ী।"
                    ar="المستخدمون مسؤولون عن الحفاظ على سرية بيانات اعتماد حساباتهم وعن جميع الأنشطة التي تحدث تحت حساباتهم."
                  />
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">
                  <LanguageText
                    en="Permitted Use"
                    bn="অনুমতিপ্রাপ্ত ব্যবহার"
                    ar="الاستخدام المسموح"
                  />
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  <LanguageText
                    en="This system is intended for educational purposes only. Users may not use the system for any illegal or unauthorized purpose."
                    bn="এই সিস্টেমটি শুধুমাত্র শিক্ষাগত উদ্দেশ্যে ব্যবহারের জন্য। ব্যবহারকারীরা কোনো অবৈধ বা অননুমোদিত উদ্দেশ্যে সিস্টেমটি ব্যবহার করতে পারবেন না।"
                    ar="هذا النظام مخصص للأغراض التعليمية فقط. لا يجوز للمستخدمين استخدام النظام لأي غرض غير قانوني أو غير مصرح به."
                  />
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">
                  <LanguageText
                    en="Data Protection"
                    bn="তথ্য সুরক্ষা"
                    ar="حماية البيانات"
                  />
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  <LanguageText
                    en="We are committed to protecting student and institutional data in accordance with applicable privacy laws and educational regulations."
                    bn="আমরা প্রযোজ্য গোপনীয়তা আইন এবং শিক্ষাগত নিয়মাবলী অনুসারে শিক্ষার্থী এবং প্রাতিষ্ঠানিক তথ্য সুরক্ষিত রাখতে প্রতিশ্রুতিবদ্ধ।"
                    ar="نحن ملتزمون بحماية بيانات الطلاب والمؤسسات وفقاً لقوانين الخصوصية المعمول بها واللوائح التعليمية."
                  />
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">
                  <LanguageText
                    en="Limitation of Liability"
                    bn="দায়বদ্ধতার সীমাবদ্ধতা"
                    ar="حدود المسؤولية"
                  />
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  <LanguageText
                    en="The service is provided 'as is' without warranties. We shall not be liable for any damages arising from the use of this system."
                    bn="সেবাটি 'যেমন আছে' সেভাবে কোনো ওয়ারেন্টি ছাড়াই প্রদান করা হয়। এই সিস্টেমের ব্যবহার থেকে উৎপন্ন কোনো ক্ষতির জন্য আমরা দায়ী থাকব না।"
                    ar="يتم تقديم الخدمة 'كما هي' بدون ضمانات. لن نكون مسؤولين عن أي أضرار ناشئة عن استخدام هذا النظام."
                  />
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">
                  <LanguageText
                    en="Contact Information"
                    bn="যোগাযোগের তথ্য"
                    ar="معلومات الاتصال"
                  />
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  <LanguageText
                    en="For questions about these terms of service, please contact your school administrator."
                    bn="এই সেবার শর্তাবলী সম্পর্কে প্রশ্নের জন্য, অনুগ্রহ করে আপনার স্কুল প্রশাসকের সাথে যোগাযোগ করুন।"
                    ar="للاستفسارات حول شروط الخدمة هذه، يرجى الاتصال بمدير مدرستك."
                  />
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}