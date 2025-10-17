import { z } from 'zod'

// Field labels mapping for form generation
export const authFieldLabels: Record<
  string,
  string | { label: string; options?: Record<string, string> }
> = {
  // General Settings
  disable_signup: '禁用注册',
  external_anonymous_users_enabled: '允许匿名登录',

  // Email Provider
  external_email_enabled: '启用邮箱提供商',
  mailer_autoconfirm: '确认邮箱',
  mailer_secure_email_change_enabled: '安全邮箱更改',
  security_update_password_require_reauthentication: '安全密码更改',
  password_hibp_enabled: '防止泄露密码',
  password_min_length: '最小密码长度',
  password_required_characters: {
    label: '密码要求',
    options: {
      NO_REQUIRED_CHARS: '无要求',
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ:0123456789': '字母和数字',
      'abcdefghijklmnopqrstuvwxyz:ABCDEFGHIJKLMNOPQRSTUVWXYZ:0123456789':
        '小写字母、大写字母和数字',
      'abcdefghijklmnopqrstuvwxyz:ABCDEFGHIJKLMNOPQRSTUVWXYZ:0123456789:!@#$%^&*()_+-=[]{};\'\\\\:"|<>?,./`~':
        '字母、数字和符号',
    },
  },
  mailer_otp_exp: '邮箱OTP过期时间（秒）',
  mailer_otp_length: '邮箱OTP长度',

  // Phone Provider
  external_phone_enabled: '启用手机提供商',
  sms_provider: {
    label: '短信提供商',
    options: {
      twilio: 'Twilio',
      messagebird: 'MessageBird',
      textlocal: 'TextLocal',
      vonage: 'Vonage',
      twilio_verify: 'Twilio Verify',
    },
  },
  sms_twilio_account_sid: 'Twilio账户SID',
  sms_twilio_auth_token: 'Twilio认证令牌',
  sms_twilio_message_service_sid: 'Twilio消息服务SID',
  sms_twilio_content_sid: 'Twilio内容SID',
  sms_twilio_verify_account_sid: 'Twilio验证账户SID',
  sms_twilio_verify_auth_token: 'Twilio验证认证令牌',
  sms_twilio_verify_message_service_sid: 'Twilio验证消息服务SID',
  sms_messagebird_access_key: 'MessageBird访问密钥',
  sms_messagebird_originator: 'MessageBird发送方',
  sms_textlocal_api_key: 'TextLocal API密钥',
  sms_textlocal_sender: 'TextLocal发送方',
  sms_vonage_api_key: 'Vonage API密钥',
  sms_vonage_api_secret: 'Vonage API密钥',
  sms_vonage_from: 'Vonage发送号码',
  sms_autoconfirm: '启用手机确认',
  sms_otp_exp: '短信OTP过期时间（秒）',
  sms_otp_length: '短信OTP长度',
  sms_template: '短信消息模板',
  sms_test_otp: '测试手机号码和OTP',
  sms_test_otp_valid_until: '测试OTP有效期至',

  // Google Provider
  external_google_enabled: '启用Google登录',
  external_google_client_id: 'Google客户端ID',
  external_google_secret: 'Google OAuth客户端密钥',
  external_google_skip_nonce_check: '跳过Nonce检查',

  // Secrets
  name: '密钥名称',
  value: '密钥值',
  secretNames: '密钥名称',
}

// New schemas for auth settings

export const authGeneralSettingsSchema = z.object({
  disable_signup: z.boolean().optional().describe('这将阻止新用户注册。'),
  external_anonymous_users_enabled: z
    .boolean()
    .optional()
    .describe('这将允许匿名用户登录您的应用程序。'),
})
export type AuthGeneralSettingsSchema = z.infer<typeof authGeneralSettingsSchema>

const NO_REQUIRED_CHARACTERS = 'NO_REQUIRED_CHARS'

export const authEmailProviderSchema = z
  .object({
    external_email_enabled: z
      .boolean()
      .optional()
      .describe('这将为您的应用程序启用基于邮箱的注册和登录。'),
    mailer_autoconfirm: z
      .boolean()
      .optional()
      .describe(
        '用户在首次登录前需要确认他们的邮箱地址。'
      ),
    mailer_secure_email_change_enabled: z
      .boolean()
      .optional()
      .describe(
        '用户需要在旧邮箱地址和新邮箱地址上确认任何邮箱更改。如果禁用，只需要新邮箱确认。'
      ),
    security_update_password_require_reauthentication: z
      .boolean()
      .optional()
      .describe(
        '用户需要最近登录才能更改密码而无需重新认证。（如果会话在过去24小时内创建，则认为用户最近已登录。）如果禁用，用户可以随时更改密码。'
      ),
    password_hibp_enabled: z
      .boolean()
      .optional()
      .describe(
        '在注册或密码更改时拒绝使用已知或容易猜测的密码。由HaveIBeenPwned.org泄露密码API提供支持。'
      ),
    password_min_length: z
      .number()
      .int()
      .min(6, '必须大于或等于6。')
      .describe(
        '短于此值的密码将被拒绝为弱密码。最少6位，建议8位或更多。'
      ),
    password_required_characters: z
      .preprocess(
        (val) => (val === '' || val === null || val === undefined ? NO_REQUIRED_CHARACTERS : val),
        z.enum([
          NO_REQUIRED_CHARACTERS,
          'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ:0123456789',
          'abcdefghijklmnopqrstuvwxyz:ABCDEFGHIJKLMNOPQRSTUVWXYZ:0123456789',
          'abcdefghijklmnopqrstuvwxyz:ABCDEFGHIJKLMNOPQRSTUVWXYZ:0123456789:!@#$%^&*()_+-=[]{};\'\\\\:"|<>?,./`~',
        ])
      )
      .optional()
      .transform((val) => (val === NO_REQUIRED_CHARACTERS ? '' : val))
      .describe('没有至少一个字符的密码将被拒绝为弱密码。'),
    mailer_otp_exp: z
      .number()
      .int()
      .min(0, '必须大于0')
      .max(86400, '必须不超过86400')
      .describe('邮箱OTP/链接过期前的持续时间（秒）。'),
    mailer_otp_length: z
      .number()
      .int()
      .min(6, '必须至少6位')
      .max(10, '必须不超过10位')
      .optional()
      .describe('邮箱OTP中的数字位数'),
  })
  .describe('邮箱提供商设置。')
export type AuthEmailProviderSchema = z.infer<typeof authEmailProviderSchema>

export const authPhoneProviderSchema = z
  .object({
    external_phone_enabled: z
      .boolean()
      .optional()
      .describe('这将为您的应用程序启用基于手机的登录'),
    sms_provider: z
      .enum(['twilio', 'messagebird', 'textlocal', 'vonage', 'twilio_verify'])
      .optional()
      .describe('处理发送短信消息的外部提供商'),
    // Twilio
    sms_twilio_account_sid: z.string().optional(),
    sms_twilio_auth_token: z.string().optional(),
    sms_twilio_message_service_sid: z.string().optional(),
    sms_twilio_content_sid: z
      .string()
      .optional()
      .describe('Twilio Content SID (Optional, For WhatsApp Only)'),
    // Twilio Verify
    sms_twilio_verify_account_sid: z.string().optional(),
    sms_twilio_verify_auth_token: z.string().optional(),
    sms_twilio_verify_message_service_sid: z.string().optional(),
    // Messagebird
    sms_messagebird_access_key: z.string().optional(),
    sms_messagebird_originator: z.string().optional(),
    // Textlocal
    sms_textlocal_api_key: z.string().optional(),
    sms_textlocal_sender: z.string().optional(),
    // Vonage
    sms_vonage_api_key: z.string().optional(),
    sms_vonage_api_secret: z.string().optional(),
    sms_vonage_from: z.string().optional(),
    // SMS Confirm settings
    sms_autoconfirm: z
      .boolean()
      .optional()
      .describe('用户在登录前需要确认他们的手机号码。'),
    sms_otp_exp: z
      .number()
      .int()
      .optional()
      .describe('短信OTP过期前的持续时间（秒）。'),
    sms_otp_length: z.number().int().optional().describe('OTP中的数字位数。'),
    sms_template: z.string().optional().describe('要格式化OTP代码，请使用`{{ .Code }}`'),
    sms_test_otp: z
      .string()
      .optional()
      .describe(
        '注册用于测试的手机号码和OTP组合，作为<手机号码>=<otp>对的逗号分隔列表。示例：`18005550123=789012`'
      ),
    sms_test_otp_valid_until: z
      .string()
      .datetime({ message: '无效的日期时间字符串。' })
      .optional()
      .describe(
        "测试手机号码和OTP组合在此日期和时间（本地时区）之后将不再有效。"
      ),
  })
  .describe('手机提供商设置。')
export type AuthPhoneProviderSchema = z.infer<typeof authPhoneProviderSchema>

export const authGoogleProviderObject = z.object({
  external_google_enabled: z.boolean().optional().describe('启用Google登录'),
  external_google_client_id: z
    .string()
    .regex(
      /^([a-z0-9-]+\.[a-z0-9-]+(\.[a-z0-9-]+)*(,[a-z0-9-]+\.[a-z0-9-]+(\.[a-z0-9-]+)*)*)$/i,
      'Google客户端ID应该是域名样式字符串的逗号分隔列表。'
    )
    .optional(),
  external_google_secret: z
    .string()
    .regex(
      /^[a-z0-9.\/_-]*$/i,
      'Google OAuth客户端密钥通常包含字母、数字、点、破折号和下划线。'
    )
    .optional(),
  external_google_skip_nonce_check: z
    .boolean()
    .optional()
    .describe('允许接受任何nonce的ID令牌，这不太安全。'),
})

export const authGoogleProviderSchema = authGoogleProviderObject
  .superRefine((data, ctx) => {
    if (data.external_google_enabled && !data.external_google_client_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['external_google_client_id'],
        message: '启用Google登录时至少需要一个客户端ID。',
      })
    }
  })
  .describe('Google提供商设置。')
export type AuthGoogleProviderSchema = z.infer<typeof authGoogleProviderSchema>

export const authConfigUpdateSchema = authGeneralSettingsSchema
  .merge(authEmailProviderSchema)
  .merge(authPhoneProviderSchema)
  .merge(authGoogleProviderObject)

export type AuthConfigUpdateSchema = z.infer<typeof authConfigUpdateSchema>

// A version used for partial updates (all fields optional)
export const authConfigUpdatePayloadSchema = authConfigUpdateSchema.partial()
