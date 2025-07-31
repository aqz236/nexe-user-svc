import wfConfig from '@nexe/eslint-config';

export default [
  ...wfConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-console': 'error', // Demo 应用允许使用 console 进行调试
    },
  },
  {
    // 忽略构建产物和临时文件
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/build/**',
      '**/.turbo/**',
      '**/bun.lockb',
      '**/*.d.ts',
      '**/src/generated/**',
      'scripts/commands-helper/**', // 忽略命令行工具
    ],
  },
];
