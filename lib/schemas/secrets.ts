import z from 'zod'

export const secretsSchema = z
  .object({
    secrets: z.array(
      z.object({
        name: z
          .string()
          .min(1, '密钥名称是必需的。')
          .regex(
            /^[a-zA-Z_][a-zA-Z0-9_]*$/,
            '必须包含字母、数字和下划线，以字母或下划线开头。'
          ),
        value: z.string().min(1, '密钥值是必需的。'),
      })
    ),
  })
  .describe('用于管理环境变量的密钥架构。')

export type SecretsSchema = z.infer<typeof secretsSchema>

export const deleteSecretsSchema = z
  .object({
    secretNames: z
      .array(z.string().min(1, '密钥名称不能为空。'))
      .min(1, '至少需要一个密钥名称。'),
  })
  .describe('按名称删除密钥的架构。')
export type DeleteSecretsSchema = z.infer<typeof deleteSecretsSchema>
