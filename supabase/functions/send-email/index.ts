
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { Resend } from "npm:resend@2.0.0";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface EmailRequest {
  type: 'reconnect_reminder' | 'onboarding' | 'weekly_digest' | 'security_notification';
  to: string;
  userId: string;
  data?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const emailRequest: EmailRequest = await req.json();
    console.log('Processing email request:', emailRequest);

    let emailContent;
    
    switch (emailRequest.type) {
      case 'reconnect_reminder':
        emailContent = await generateReconnectReminderEmail(emailRequest.data);
        break;
      case 'onboarding':
        emailContent = await generateOnboardingEmail(emailRequest.data);
        break;
      case 'weekly_digest':
        emailContent = await generateWeeklyDigestEmail(emailRequest.data);
        break;
      case 'security_notification':
        emailContent = await generateSecurityNotificationEmail(emailRequest.data);
        break;
      default:
        throw new Error(`Unknown email type: ${emailRequest.type}`);
    }

    const emailResponse = await resend.emails.send({
      from: 'Circl <notifications@circl.app>',
      to: [emailRequest.to],
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    // Log successful email send
    await supabase.from('email_logs').insert({
      user_id: emailRequest.userId,
      email_type: emailRequest.type,
      recipient: emailRequest.to,
      status: 'sent',
      resend_id: emailResponse.data?.id,
      sent_at: new Date().toISOString()
    });

    console.log('Email sent successfully:', emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Email sending error:', error);

    // Log failed email attempt
    try {
      const emailRequest: EmailRequest = await req.json();
      await supabase.from('email_logs').insert({
        user_id: emailRequest.userId,
        email_type: emailRequest.type,
        recipient: emailRequest.to,
        status: 'failed',
        error_message: error.message,
        sent_at: new Date().toISOString()
      });
    } catch (logError) {
      console.error('Failed to log email error:', logError);
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateReconnectReminderEmail(data: any) {
  const { userName, contacts, suggestions } = data;
  
  const contactsHtml = contacts.map((contact: any, index: number) => {
    const suggestion = suggestions?.[index];
    return `
      <div style="margin-bottom: 20px; padding: 15px; border-left: 3px solid #3b82f6; background-color: #f8fafc;">
        <h3 style="margin: 0 0 8px 0; color: #1e293b;">${contact.name}</h3>
        <p style="margin: 0 0 8px 0; color: #64748b;">
          ${contact.company_name ? `${contact.job_title} at ${contact.company_name}` : contact.job_title || 'Contact'}
        </p>
        <p style="margin: 0 0 8px 0; color: #64748b;">
          Last contact: ${contact.last_contact ? new Date(contact.last_contact).toLocaleDateString() : 'Never'}
        </p>
        ${suggestion ? `
          <div style="background-color: #e0f2fe; padding: 10px; border-radius: 4px; margin-top: 10px;">
            <strong>💡 AI Suggestion:</strong> ${suggestion}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Time to Reconnect - Circl</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #3b82f6; margin-bottom: 10px;">🔗 Time to Reconnect</h1>
        <p style="color: #64748b; margin: 0;">Your relationship reminders from Circl</p>
      </div>
      
      <p>Hi ${userName},</p>
      
      <p>It's been a while since you've connected with some important people in your network. Here are some contacts you might want to reach out to:</p>
      
      ${contactsHtml}
      
      <div style="margin-top: 30px; padding: 20px; background-color: #f1f5f9; border-radius: 8px; text-align: center;">
        <p style="margin: 0 0 15px 0;">Ready to reconnect?</p>
        <a href="https://circl.app/circles" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
          Open Circl
        </a>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 14px;">
        <p>Best regards,<br>The Circl Team</p>
        <p style="margin-top: 15px;">
          <a href="https://circl.app/settings" style="color: #64748b;">Manage notification preferences</a>
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
Time to Reconnect - Circl

Hi ${userName},

It's been a while since you've connected with some important people in your network. Here are some contacts you might want to reach out to:

${contacts.map((contact: any, index: number) => {
  const suggestion = suggestions?.[index];
  return `
${contact.name}
${contact.company_name ? `${contact.job_title} at ${contact.company_name}` : contact.job_title || 'Contact'}
Last contact: ${contact.last_contact ? new Date(contact.last_contact).toLocaleDateString() : 'Never'}
${suggestion ? `AI Suggestion: ${suggestion}` : ''}
  `;
}).join('\n---\n')}

Ready to reconnect? Visit: https://circl.app/circles

Best regards,
The Circl Team

Manage notification preferences: https://circl.app/settings
  `;

  return {
    subject: `🔗 Time to reconnect with ${contacts.length} contact${contacts.length > 1 ? 's' : ''}`,
    html,
    text
  };
}

async function generateOnboardingEmail(data: any) {
  const { userName, userEmail } = data;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to Circl!</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #3b82f6; margin-bottom: 10px;">🎉 Welcome to Circl!</h1>
        <p style="color: #64748b; margin: 0;">Your relationship management journey starts here</p>
      </div>
      
      <p>Hi ${userName || 'there'},</p>
      
      <p>Welcome to Circl! We're excited to help you strengthen and maintain your most important relationships.</p>
      
      <div style="margin: 30px 0;">
        <h2 style="color: #1e293b; margin-bottom: 15px;">🚀 Let's get you started:</h2>
        
        <div style="margin-bottom: 20px; padding: 15px; background-color: #f8fafc; border-radius: 8px;">
          <h3 style="margin: 0 0 8px 0; color: #3b82f6;">1. Add Your First Contacts</h3>
          <p style="margin: 0; color: #64748b;">Start by adding the people who matter most to you. Organize them into Inner, Middle, and Outer circles based on your relationship strength.</p>
        </div>
        
        <div style="margin-bottom: 20px; padding: 15px; background-color: #f8fafc; border-radius: 8px;">
          <h3 style="margin: 0 0 8px 0; color: #3b82f6;">2. Track Interactions</h3>
          <p style="margin: 0; color: #64748b;">Log your conversations, meetings, and touchpoints to keep track of your relationship history.</p>
        </div>
        
        <div style="margin-bottom: 20px; padding: 15px; background-color: #f8fafc; border-radius: 8px;">
          <h3 style="margin: 0 0 8px 0; color: #3b82f6;">3. Set Up Reminders</h3>
          <p style="margin: 0; color: #64748b;">Enable smart reminders to help you stay connected with people you haven't talked to in a while.</p>
        </div>
        
        <div style="margin-bottom: 20px; padding: 15px; background-color: #f8fafc; border-radius: 8px;">
          <h3 style="margin: 0 0 8px 0; color: #3b82f6;">4. Connect Your Email</h3>
          <p style="margin: 0; color: #64748b;">Sync your Gmail to automatically track email interactions and keep your contact information up to date.</p>
        </div>
      </div>
      
      <div style="margin-top: 30px; padding: 20px; background-color: #f1f5f9; border-radius: 8px; text-align: center;">
        <p style="margin: 0 0 15px 0;">Ready to build stronger relationships?</p>
        <a href="https://circl.app" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
          Start Using Circl
        </a>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 14px;">
        <p>Questions? Reply to this email - we'd love to help!</p>
        <p style="margin-top: 15px;">
          Best regards,<br>The Circl Team
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
Welcome to Circl!

Hi ${userName || 'there'},

Welcome to Circl! We're excited to help you strengthen and maintain your most important relationships.

Let's get you started:

1. Add Your First Contacts
Start by adding the people who matter most to you. Organize them into Inner, Middle, and Outer circles based on your relationship strength.

2. Track Interactions
Log your conversations, meetings, and touchpoints to keep track of your relationship history.

3. Set Up Reminders
Enable smart reminders to help you stay connected with people you haven't talked to in a while.

4. Connect Your Email
Sync your Gmail to automatically track email interactions and keep your contact information up to date.

Ready to build stronger relationships? Visit: https://circl.app

Questions? Reply to this email - we'd love to help!

Best regards,
The Circl Team
  `;

  return {
    subject: "🎉 Welcome to Circl - Let's strengthen your relationships!",
    html,
    text
  };
}

async function generateWeeklyDigestEmail(data: any) {
  const { userName, stats, interactions, staleContacts, recommendations } = data;
  
  const interactionsHtml = interactions?.slice(0, 5).map((interaction: any) => `
    <li style="margin-bottom: 8px; color: #64748b;">
      <strong>${interaction.contact_name}</strong> - ${interaction.type} 
      <span style="color: #94a3b8;">(${new Date(interaction.date).toLocaleDateString()})</span>
    </li>
  `).join('') || '<li style="color: #94a3b8;">No interactions this week</li>';

  const staleContactsHtml = staleContacts?.slice(0, 3).map((contact: any) => `
    <li style="margin-bottom: 8px; color: #64748b;">
      <strong>${contact.name}</strong> - Last contact: ${contact.last_contact ? new Date(contact.last_contact).toLocaleDateString() : 'Never'}
    </li>
  `).join('') || '<li style="color: #94a3b8;">All contacts up to date!</li>';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your Weekly Relationship Digest</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #3b82f6; margin-bottom: 10px;">📊 Your Weekly Digest</h1>
        <p style="color: #64748b; margin: 0;">Your relationship activity summary from Circl</p>
      </div>
      
      <p>Hi ${userName},</p>
      
      <p>Here's a summary of your relationship activity this week:</p>
      
      <div style="margin: 20px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
        <h3 style="margin: 0 0 15px 0; color: #1e293b;">📈 Network Overview</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px;">
          <div style="text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">${stats?.total || 0}</div>
            <div style="color: #64748b; font-size: 14px;">Total Contacts</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #10b981;">${stats?.inner || 0}</div>
            <div style="color: #64748b; font-size: 14px;">Inner Circle</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #f59e0b;">${stats?.middle || 0}</div>
            <div style="color: #64748b; font-size: 14px;">Middle Circle</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #6b7280;">${stats?.outer || 0}</div>
            <div style="color: #64748b; font-size: 14px;">Outer Circle</div>
          </div>
        </div>
      </div>
      
      <div style="margin: 20px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
        <h3 style="margin: 0 0 15px 0; color: #1e293b;">💬 Recent Interactions</h3>
        <ul style="margin: 0; padding-left: 20px;">
          ${interactionsHtml}
        </ul>
      </div>
      
      ${staleContacts?.length > 0 ? `
      <div style="margin: 20px 0; padding: 20px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
        <h3 style="margin: 0 0 15px 0; color: #92400e;">⏰ Contacts to Reconnect With</h3>
        <ul style="margin: 0; padding-left: 20px;">
          ${staleContactsHtml}
        </ul>
      </div>
      ` : ''}
      
      ${recommendations ? `
      <div style="margin: 20px 0; padding: 20px; background-color: #e0f2fe; border-radius: 8px;">
        <h3 style="margin: 0 0 15px 0; color: #0c4a6e;">💡 This Week's Recommendation</h3>
        <p style="margin: 0; color: #164e63;">${recommendations}</p>
      </div>
      ` : ''}
      
      <div style="margin-top: 30px; padding: 20px; background-color: #f1f5f9; border-radius: 8px; text-align: center;">
        <p style="margin: 0 0 15px 0;">Keep building strong relationships!</p>
        <a href="https://circl.app/circles" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
          View Your Circles
        </a>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 14px;">
        <p>Best regards,<br>The Circl Team</p>
        <p style="margin-top: 15px;">
          <a href="https://circl.app/settings" style="color: #64748b;">Manage notification preferences</a>
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
Your Weekly Relationship Digest - Circl

Hi ${userName},

Here's a summary of your relationship activity this week:

Network Overview:
- Total Contacts: ${stats?.total || 0}
- Inner Circle: ${stats?.inner || 0}
- Middle Circle: ${stats?.middle || 0}
- Outer Circle: ${stats?.outer || 0}

Recent Interactions:
${interactions?.slice(0, 5).map((interaction: any) => 
  `- ${interaction.contact_name} - ${interaction.type} (${new Date(interaction.date).toLocaleDateString()})`
).join('\n') || '- No interactions this week'}

${staleContacts?.length > 0 ? `
Contacts to Reconnect With:
${staleContacts.slice(0, 3).map((contact: any) => 
  `- ${contact.name} - Last contact: ${contact.last_contact ? new Date(contact.last_contact).toLocaleDateString() : 'Never'}`
).join('\n')}
` : ''}

${recommendations ? `This Week's Recommendation: ${recommendations}` : ''}

Keep building strong relationships! Visit: https://circl.app/circles

Best regards,
The Circl Team

Manage notification preferences: https://circl.app/settings
  `;

  return {
    subject: "📊 Your Weekly Relationship Digest",
    html,
    text
  };
}

async function generateSecurityNotificationEmail(data: any) {
  const { userName, notificationType, details, timestamp, location } = data;
  
  let subject, content;
  
  switch (notificationType) {
    case 'login_alert':
      subject = "🔐 New login to your Circl account";
      content = {
        title: "New Login Detected",
        message: `We detected a new login to your Circl account from ${location || 'an unknown location'}.`,
        action: "If this wasn't you, please secure your account immediately."
      };
      break;
    case 'password_change':
      subject = "🔑 Password changed for your Circl account";
      content = {
        title: "Password Changed",
        message: "Your Circl account password was successfully changed.",
        action: "If you didn't make this change, please contact support immediately."
      };
      break;
    case 'email_change':
      subject = "📧 Email address changed for your Circl account";
      content = {
        title: "Email Address Changed",
        message: "Your Circl account email address was successfully updated.",
        action: "If you didn't make this change, please contact support immediately."
      };
      break;
    default:
      subject = "🔔 Security notification for your Circl account";
      content = {
        title: "Security Notification",
        message: details || "A security-related change was made to your account.",
        action: "If you didn't authorize this change, please contact support."
      };
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #dc2626; margin-bottom: 10px;">${content.title}</h1>
        <p style="color: #64748b; margin: 0;">Security notification from Circl</p>
      </div>
      
      <p>Hi ${userName},</p>
      
      <div style="margin: 20px 0; padding: 20px; background-color: #fef2f2; border-left: 4px solid #dc2626; border-radius: 8px;">
        <p style="margin: 0; color: #7f1d1d;">${content.message}</p>
        ${timestamp ? `<p style="margin: 10px 0 0 0; color: #991b1b; font-size: 14px;">Time: ${new Date(timestamp).toLocaleString()}</p>` : ''}
        ${location ? `<p style="margin: 5px 0 0 0; color: #991b1b; font-size: 14px;">Location: ${location}</p>` : ''}
      </div>
      
      <p style="color: #7f1d1d; font-weight: 500;">${content.action}</p>
      
      <div style="margin-top: 30px; padding: 20px; background-color: #f1f5f9; border-radius: 8px; text-align: center;">
        <p style="margin: 0 0 15px 0;">Need help securing your account?</p>
        <a href="https://circl.app/settings" style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin-right: 10px;">
          Account Settings
        </a>
        <a href="mailto:support@circl.app" style="display: inline-block; background-color: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
          Contact Support
        </a>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 14px;">
        <p>This is an automated security notification.</p>
        <p style="margin-top: 15px;">
          Best regards,<br>The Circl Security Team
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
${content.title} - Circl Security Notification

Hi ${userName},

${content.message}
${timestamp ? `Time: ${new Date(timestamp).toLocaleString()}` : ''}
${location ? `Location: ${location}` : ''}

${content.action}

Need help? 
- Account Settings: https://circl.app/settings
- Contact Support: support@circl.app

This is an automated security notification.

Best regards,
The Circl Security Team
  `;

  return {
    subject,
    html,
    text
  };
}
