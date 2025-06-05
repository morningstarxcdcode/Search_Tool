import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';

const Privacy: React.FC = () => {
  const sections = [
    {
      title: '1. 事業者情報',
      content: '本プライバシーポリシーは、Ｕｔｅｎａ（代表：鎌谷 哲平、以下「当事業者」といいます。）が提供する「セラーナビ」（以下「本サービス」といいます。）において、ユーザーの個人情報を適切に取り扱うための方針を定めるものです。'
    },
    {
      title: '2. 取得する情報',
      content: '当事業者は、本サービスの提供にあたり、以下の情報を取得する場合があります。',
      list: [
        'メールアドレス',
        '氏名（入力された場合）',
        'アクセスログ（IPアドレス、ブラウザ情報、端末情報等）',
        'Cookie情報'
      ]
    },
    {
      title: '3. 利用目的',
      content: '当事業者は、取得した情報を以下の目的のために利用いたします。',
      list: [
        '本サービスの提供および運営のため',
        'ユーザーからのお問い合わせ対応のため',
        '機能改善およびサービス品質向上のため',
        '法令または利用規約に違反する行為への対応のため',
        'マーケティングおよび広告配信の最適化（将来的に実施する場合を含む）'
      ]
    },
    {
      title: '4. 保存期間',
      content: '取得した情報は、利用目的の達成に必要な範囲で適切に保存し、不要になった情報から順次、適切な方法で削除・破棄いたします。 データ種別ごとの保存期間の目安は以下の通りです。',
      list: [
        'メールアドレス・氏名：ユーザーの利用停止後2年間保存（法令等に基づく対応のため）',
        'アクセスログ（IPアドレス、端末情報など）：6ヶ月〜1年を目安に削除',
        'Cookie情報：最大1年間保持（ユーザーの設定変更による削除も可能）'
      ]
    },
    {
      title: '5. 第三者提供',
      content: '当事業者は、以下の場合を除き、ユーザーの個人情報を第三者に提供いたしません。',
      list: [
        '本人の同意がある場合',
        '法令に基づく場合',
        '人命・財産保護のため必要な場合',
        '業務委託先に機密保持契約を締結の上で提供する場合'
      ]
    },
    {
      title: '6. 外部サービスの利用について',
      content: '当事業者は、サービス向上のためGoogle Analytics等のアクセス解析ツールを利用いたします。 これらのツールによって収集される情報は匿名化されており、個人を特定するものではありません。'
    },
    {
      title: '7. 安全管理措置',
      content: '当事業者は、個人情報を保護するため以下の安全管理措置を講じます。',
      list: [
        '通信の暗号化（SSL）',
        'アクセス制限および社内規程整備',
        '外部委託先との機密保持契約',
        '社内教育および不正アクセス対策'
      ]
    },
    {
      title: '8. ユーザーの権利',
      content: 'ユーザーは、当事業者に対して以下の請求を行うことができます。',
      list: [
        '自身の個人情報の開示',
        '訂正、追加、削除の請求',
        '利用停止または消去の請求'
      ],
      additionalContent: 'これらの請求を行う場合、ユーザーご本人であることを確認するため、当事業者所定の方法により本人確認を実施いたします。 なお、以下の場合は法令上の理由によりご希望に添えない可能性があります。',
      additionalList: [
        '当事業者が法令上の義務により一定期間保存することが義務付けられている情報',
        '対応に過大な費用を要する場合や、その他正当な理由があると判断される場合'
      ],
      finalContent: '請求内容に応じた対応の結果は、合理的な期間内にご連絡いたします。 ご希望の際は下記お問い合わせ先までご連絡ください。'
    },
    {
      title: '9. Cookie等の利用について',
      content: '当サービスでは、Cookieや類似技術を使用することがあります。 これらは、利便性の向上、利用状況の分析、サービス改善等を目的としています。',
      subtitle: 'Cookieの管理・オプトアウト方法について',
      list: [
        'ブラウザ設定でCookieの使用を制限または拒否可能（設定変更によりCookieの削除も可能）',
        'Googleの広告設定ページ（https://adssettings.google.com/）で広告Cookieの管理可能'
      ],
      note: '※一部機能が利用できなくなる場合があるため、設定変更時は注意'
    },
    {
      title: '10. プライバシーポリシーの変更',
      content: '当事業者は、本プライバシーポリシーの内容を随時見直し、必要に応じて変更することがあります。 変更後のプライバシーポリシーは、本サービス上に掲示した時点から効力を有するものとします。'
    },
    {
      title: '11. お問い合わせ窓口',
      content: '個人情報に関するお問い合わせは以下の窓口までご連絡ください。',
      contact: 'メールアドレス：support@sellernavi.com'
    }
  ];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
          プライバシーポリシー
        </Typography>
        
        {sections.map((section, index) => (
          <Box key={index} sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              {section.title}
            </Typography>
            <Typography variant="body1" paragraph>
              {section.content}
            </Typography>
            
            {section.subtitle && (
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'medium' }}>
                {section.subtitle}
              </Typography>
            )}
            
            {section.list && (
              <List sx={{ pl: 2 }}>
                {section.list.map((item, itemIndex) => (
                  <ListItem key={itemIndex} sx={{ py: 0.5 }}>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            )}
            
            {section.additionalContent && (
              <Typography variant="body1" paragraph sx={{ mt: 2 }}>
                {section.additionalContent}
              </Typography>
            )}
            
            {section.additionalList && (
              <List sx={{ pl: 2 }}>
                {section.additionalList.map((item, itemIndex) => (
                  <ListItem key={itemIndex} sx={{ py: 0.5 }}>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            )}
            
            {section.finalContent && (
              <Typography variant="body1" paragraph sx={{ mt: 2 }}>
                {section.finalContent}
              </Typography>
            )}
            
            {section.note && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {section.note}
              </Typography>
            )}
            
            {section.contact && (
              <Typography variant="body1" sx={{ mt: 2, fontWeight: 'medium' }}>
                {section.contact}
              </Typography>
            )}
            
            {index < sections.length - 1 && <Divider sx={{ mt: 3 }} />}
          </Box>
        ))}
      </Paper>
    </Container>
  );
};

export default Privacy; 