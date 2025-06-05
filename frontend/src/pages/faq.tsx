import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const FAQ: React.FC = () => {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const faqItems = [
    {
      question: 'セラーナビってどんなツールですか？',
      answer: 'セラーナビは、メルカリ物販に特化したリサーチ支援ツールです。中国物販だけでなく、国内商品の売れ筋もランキング形式でチェックでき、競合分析にも対応しているため、初心者でも売れ筋商品を直感的に把握できるように設計されています。'
    },
    {
      question: 'メルカリの公式ツールなんですか？',
      answer: 'いいえ。セラーナビは、メルカリ株式会社とは一切関係のない独立サービスです。メルカリ上で公開されている情報を、独自技術で解析・表示しています。'
    },
    {
      question: 'スマホでも使えますか？',
      answer: 'はい。Webアプリとして提供しているため、スマホのブラウザからも問題なくご利用いただけます。将来的にはスマホアプリの開発を視野にいれています。'
    },
    {
      question: '無料で使えますか？',
      answer: 'はい。新規登録後、7日間のプレミアムプラン無料体験をご利用いただけます。無料体験期間が終了すると、自動的にフリープラン（無料）へ移行し、継続してツールをご利用いただけます。フリープランでは、一部機能に制限がありますが、ランキング検索（月3回）などの基本機能をご利用いただけます。引き続き有料プランの機能をご利用いただく場合は、有料プランの登録操作をお願いいたします。'
    },
    {
      question: '各プランの違いはなんですか？',
      answer: (
        <Box>
          <Typography variant="body1" gutterBottom>
            セラーナビには3つのプランがあります。
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="フリープラン（無料）"
                secondary="・ランキング検索：月3回"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="スタンダードプラン（2,480円/月）"
                secondary={
                  <>
                    <Typography component="span" variant="body2">
                      ・ランキング検索：月30回
                      <br />
                      ・競合分析：月30回
                      <br />
                      ・CSV出力：月5回
                      <br />
                      ・検索履歴保存：5日間
                      <br />
                      ・カスタムタグ：〇
                    </Typography>
                  </>
                }
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="プレミアムプラン（3,480円/月）"
                secondary={
                  <>
                    <Typography component="span" variant="body2">
                      ・すべて無制限
                      <br />
                      ・AI検索補助：〇
                      <br />
                      ・優先レスポンス対応：〇
                    </Typography>
                  </>
                }
              />
            </ListItem>
          </List>
        </Box>
      )
    },
    {
      question: '無料体験が終わったら、自動で課金されますか？',
      answer: 'いいえ、自動で課金されることはありません。無料期間が終了すると、自動的にフリープラン（無料）へ移行します。そのため、継続しても費用は一切発生しません。有料プランをご希望の場合は、設定ページよりいつでもアップグレードが可能です。'
    },
    {
      question: '支払い方法を途中で変更できますか？',
      answer: '現時点ではクレジットカード決済のみ対応しています。カードの変更は設定ページからいつでも可能です。'
    },
    {
      question: '登録せずに使えますか？',
      answer: '無料登録であるフリープランではランキング検索のみ利用可能ですが、本格的なリサーチ・分析機能を使うには有料登録がおすすめです。'
    },
    {
      question: '他人にログイン情報を共有して使ってもいいですか？',
      answer: 'セキュリティと不正利用防止のため、アカウントの共有は禁止しています。'
    },
    {
      question: 'データの更新頻度はどれくらいですか？',
      answer: '売上ランキングなどの情報は定期的に更新されます。ただし、データ反映のタイミングはシステム設計に基づいて管理されており、常に最新情報を提供するよう努めています。'
    },
    {
      question: '解約したらデータはどうなりますか？',
      answer: (
        <Box>
          <Typography variant="body1" gutterBottom>
            解約するとアカウントが完全に削除され、復元はできません。データの保存期間は以下の通りです。
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="・メールアドレス・氏名：利用停止後2年間保存" />
            </ListItem>
            <ListItem>
              <ListItemText primary="・アクセスログ（IPアドレス、端末情報など）：6ヶ月〜1年保存" />
            </ListItem>
            <ListItem>
              <ListItemText primary="・その他のデータ（検索履歴など）：解約後即時削除される可能性があります" />
            </ListItem>
          </List>
          <Typography variant="body1">
            必要なデータは事前にCSVなどでダウンロードしておくことをおすすめします。
          </Typography>
        </Box>
      )
    },
    {
      question: 'セラーナビを使ってトラブルが起きた場合、サポートしてもらえますか？',
      answer: 'セラーナビはあくまで情報提供ツールです。取引・仕入れ・販売などに関するトラブルについては、ユーザーの責任にてご対応ください。'
    },
    {
      question: 'メルカリの規約に違反しませんか？',
      answer: (
        <Box>
          <Typography variant="body1" gutterBottom>
            セラーナビはメルカリの公開情報をもとに運営されていますが、利用に際してはメルカリの規約を必ず遵守してください。例えば以下のような行為は規約違反になる可能性があります。
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="・メルカリのAPIを不正に利用する行為" />
            </ListItem>
            <ListItem>
              <ListItemText primary="・禁止されている商品の出品や取引" />
            </ListItem>
            <ListItem>
              <ListItemText primary="・自動操作ツールの使用（Botなど）" />
            </ListItem>
          </List>
          <Typography variant="body1">
            規約違反となる行為が確認された場合、責任はユーザーに帰属します。
          </Typography>
        </Box>
      )
    },
    {
      question: '法人としても使えますか？',
      answer: 'はい。法人の方でもご利用いただけます。ただし、現在はオンライン決済（クレジットカード）のみ対応しており、請求書払い等の個別対応は承っておりません。'
    },
    {
      question: '個人情報は安全に管理されていますか？',
      answer: 'はい。セラーナビではSSL通信による暗号化と厳重な情報管理体制を導入しています。詳細はプライバシーポリシーをご覧ください。'
    },
    {
      question: 'メールアドレスを変更できますか？',
      answer: '登録済みのメールアドレスは、マイページから変更が可能です。ご不明な場合は、お問い合わせ窓口までご連絡ください。'
    },
    {
      question: '推奨環境はありますか？',
      answer: 'セラーナビは、Google Chrome（最新版）、Microsoft Edge（最新版）、Safari（最新版）での利用を推奨しています。推奨環境以外では、一部機能が正常に動作しない可能性がありますので、ご注意ください。'
    },
    {
      question: 'サポート対応の返信はどれくらいかかりますか？',
      answer: '通常1～3営業日以内に返信いたします。状況により遅れる場合がありますが、ご了承ください。'
    },
    {
      question: '複数アカウントを作成してもいいですか？',
      answer: '1人につき1つのアカウントのみ作成可能です。不正利用防止のため、複数アカウントの作成は禁止しています。'
    }
  ];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
          セラーナビ｜よくある質問（FAQ）
        </Typography>
        
        {faqItems.map((item, index) => (
          <Accordion
            key={index}
            expanded={expanded === `panel${index}`}
            onChange={handleChange(`panel${index}`)}
            sx={{
              mb: 2,
              '&:before': {
                display: 'none',
              },
              boxShadow: 'none',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '8px !important',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: expanded === `panel${index}` ? 'action.hover' : 'background.paper',
                borderRadius: '8px',
              }}
            >
              <Typography variant="subtitle1" fontWeight="medium">
                Q{index + 1}. {item.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                {item.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>
    </Container>
  );
};

export default FAQ; 