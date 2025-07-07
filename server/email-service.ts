import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private isConfigured: boolean = false;

  constructor() {
    this.setupTransporter();
  }

  private setupTransporter() {
    try {
      // Check for email configuration
      const emailConfig: EmailConfig = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || ''
        }
      };

      if (emailConfig.auth.user && emailConfig.auth.pass) {
        this.transporter = nodemailer.createTransporter(emailConfig);
        this.isConfigured = true;
        console.log('✅ Email service configured successfully');
      } else {
        console.log('⚠️ Email service not configured - missing SMTP credentials');
        this.isConfigured = false;
      }
    } catch (error) {
      console.error('❌ Email service configuration failed:', error);
      this.isConfigured = false;
    }
  }

  async sendEmail(to: string, template: EmailTemplate, fromName: string = 'EduBD Pro'): Promise<boolean> {
    if (!this.isConfigured) {
      console.log('Email not sent - service not configured');
      return false;
    }

    try {
      const mailOptions = {
        from: `"${fromName}" <${process.env.SMTP_USER}>`,
        to,
        subject: template.subject,
        text: template.text,
        html: template.html
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${to}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }

  // Welcome email for new users
  async sendWelcomeEmail(email: string, name: string, schoolName: string, tempPassword: string): Promise<boolean> {
    const template: EmailTemplate = {
      subject: `Welcome to ${schoolName} - EduBD Pro Account Created`,
      text: `Welcome ${name}! Your account has been created for ${schoolName}. Your temporary password is: ${tempPassword}. Please login and change your password immediately.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to ${schoolName}</h2>
          <p>Dear ${name},</p>
          <p>Your account has been successfully created for <strong>${schoolName}</strong> on the EduBD Pro platform.</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0;">Login Credentials</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${tempPassword}</code></p>
          </div>
          <p><strong>Important:</strong> Please login and change your password immediately for security.</p>
          <p>If you have any questions, please contact your school administrator.</p>
          <p>Best regards,<br>EduBD Pro Team</p>
        </div>
      `
    };

    return this.sendEmail(email, template, schoolName);
  }

  // Password reset email
  async sendPasswordResetEmail(email: string, name: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`;
    
    const template: EmailTemplate = {
      subject: 'Password Reset Request - EduBD Pro',
      text: `Hello ${name}, you requested a password reset. Click this link to reset your password: ${resetUrl}. This link will expire in 1 hour.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Password Reset Request</h2>
          <p>Hello ${name},</p>
          <p>You requested a password reset for your EduBD Pro account.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
          </div>
          <p><strong>This link will expire in 1 hour.</strong></p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>Best regards,<br>EduBD Pro Team</p>
        </div>
      `
    };

    return this.sendEmail(email, template);
  }

  // Document generation notification
  async sendDocumentNotification(email: string, name: string, documentType: string, documentCount: number): Promise<boolean> {
    const template: EmailTemplate = {
      subject: `Documents Generated - ${documentType}`,
      text: `Hello ${name}, ${documentCount} ${documentType} documents have been generated successfully in your EduBD Pro account.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Documents Generated Successfully</h2>
          <p>Hello ${name},</p>
          <p><strong>${documentCount}</strong> ${documentType} documents have been generated successfully.</p>
          <p>You can access and download your documents from the EduBD Pro dashboard.</p>
          <p>Best regards,<br>EduBD Pro Team</p>
        </div>
      `
    };

    return this.sendEmail(email, template);
  }

  // System notification email
  async sendSystemNotification(email: string, name: string, title: string, message: string): Promise<boolean> {
    const template: EmailTemplate = {
      subject: `System Notification - ${title}`,
      text: `Hello ${name}, ${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">${title}</h2>
          <p>Hello ${name},</p>
          <p>${message}</p>
          <p>Best regards,<br>EduBD Pro Team</p>
        </div>
      `
    };

    return this.sendEmail(email, template);
  }

  // Bulk email sending for announcements
  async sendBulkEmail(emails: string[], template: EmailTemplate): Promise<{ sent: number; failed: number }> {
    if (!this.isConfigured) {
      return { sent: 0, failed: emails.length };
    }

    let sent = 0;
    let failed = 0;

    for (const email of emails) {
      const success = await this.sendEmail(email, template);
      if (success) {
        sent++;
      } else {
        failed++;
      }
      
      // Add delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return { sent, failed };
  }

  // Test email configuration
  async testConnection(): Promise<boolean> {
    if (!this.isConfigured) {
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('✅ Email service connection test successful');
      return true;
    } catch (error) {
      console.error('❌ Email service connection test failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();