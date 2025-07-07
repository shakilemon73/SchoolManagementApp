import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageText } from "@/components/ui/language-text";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              <LanguageText
                en="Privacy Policy"
                bn="গোপনীয়তার নীতি"
                ar="سياسة الخصوصية"
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold mb-3">
                  <LanguageText
                    en="Information We Collect"
                    bn="আমরা যে তথ্য সংগ্রহ করি"
                    ar="المعلومات التي نجمعها"
                  />
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  <LanguageText
                    en="We collect information necessary to provide educational management services, including student records, academic data, and administrative information."
                    bn="আমরা শিক্ষা ব্যবস্থাপনা সেবা প্রদানের জন্য প্রয়োজনীয় তথ্য সংগ্রহ করি, যার মধ্যে রয়েছে শিক্ষার্থীর রেকর্ড, একাডেমিক তথ্য এবং প্রশাসনিক তথ্য।"
                    ar="نجمع المعلومات اللازمة لتقديم خدمات إدارة التعليم، بما في ذلك سجلات الطلاب والبيانات الأكاديمية والمعلومات الإدارية."
                  />
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">
                  <LanguageText
                    en="How We Use Your Information"
                    bn="আমরা কীভাবে আপনার তথ্য ব্যবহার করি"
                    ar="كيف نستخدم معلوماتك"
                  />
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  <LanguageText
                    en="Your information is used to provide educational services, generate documents, track academic progress, and facilitate communication between students, teachers, and parents."
                    bn="আপনার তথ্য শিক্ষা সেবা প্রদান, নথি তৈরি, একাডেমিক অগ্রগতি ট্র্যাক করা এবং শিক্ষার্থী, শিক্ষক ও অভিভাবকদের মধ্যে যোগাযোগ সুবিধার জন্য ব্যবহৃত হয়।"
                    ar="تُستخدم معلوماتك لتقديم الخدمات التعليمية وإنشاء المستندات وتتبع التقدم الأكاديمي وتسهيل التواصل بين الطلاب والمعلمين وأولياء الأمور."
                  />
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">
                  <LanguageText
                    en="Data Security"
                    bn="তথ্য নিরাপত্তা"
                    ar="أمان البيانات"
                  />
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  <LanguageText
                    en="We implement industry-standard security measures to protect your data, including encryption, secure authentication, and regular security audits."
                    bn="আমরা আপনার তথ্য রক্ষা করতে শিল্প-মানের নিরাপত্তা ব্যবস্থা বাস্তবায়ন করি, যার মধ্যে রয়েছে এনক্রিপশন, নিরাপদ প্রমাণীকরণ এবং নিয়মিত নিরাপত্তা অডিট।"
                    ar="نطبق تدابير أمنية معيارية في الصناعة لحماية بياناتك، بما في ذلك التشفير والمصادقة الآمنة وعمليات التدقيق الأمني المنتظمة."
                  />
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">
                  <LanguageText
                    en="Contact Us"
                    bn="আমাদের সাথে যোগাযোগ করুন"
                    ar="اتصل بنا"
                  />
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  <LanguageText
                    en="If you have questions about this privacy policy, please contact your school administrator."
                    bn="এই গোপনীয়তার নীতি সম্পর্কে যদি আপনার কোন প্রশ্ন থাকে, অনুগ্রহ করে আপনার স্কুল প্রশাসকের সাথে যোগাযোগ করুন।"
                    ar="إذا كانت لديك أسئلة حول سياسة الخصوصية هذه، يرجى الاتصال بمدير مدرستك."
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