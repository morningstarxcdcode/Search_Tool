import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  useTheme
} from '@mui/material';
import Image from 'next/image';

const TermsPage = () => {
  const theme = useTheme();

  return (
    <Box sx={{ py: 8, bgcolor: 'background.default' }}>
      <Container maxWidth="md">
        <Paper sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Image
              src="/logo.png"
              alt="Seller Navi Logo"
              width={180}
              height={60}
              style={{ objectFit: 'contain', marginBottom: '2rem' }}
            />
            <Typography variant="h4" component="h1" gutterBottom>
              利用規約
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              最終更新日: 2024年3月1日
            </Typography>
          </Box>

          {/* Introduction */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="body1" paragraph>
              本規約は、Seller Navi（以下「当社」）が提供するサービス（以下「本サービス」）の利用条件を定めるものです。
              ユーザーは本規約に同意の上、本サービスを利用するものとします。
            </Typography>
          </Box>

          {/* Terms Sections */}
          <List>
            {/* Section 1 */}
            <ListItem sx={{ display: 'block', mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                第1条（適用）
              </Typography>
              <Typography variant="body1" paragraph>
                本規約は、本サービスの利用に関する当社とユーザーとの間の権利義務関係を定めることを目的とし、
                ユーザーは本規約に同意した時点で本サービスを利用することができます。
              </Typography>
            </ListItem>

            {/* Section 2 */}
            <ListItem sx={{ display: 'block', mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                第2条（定義）
              </Typography>
              <Typography variant="body1" paragraph>
                本規約において使用する以下の用語は、各々以下に定める意味を有するものとします。
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="「コンテンツ」"
                    secondary="本サービスを通じてアクセスすることができる当社が提供する情報、テキスト、音声、音楽、画像、動画、ソフトウェア、プログラム、コードその他の情報のことをいいます。"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="「ユーザー情報」"
                    secondary="ユーザーが当社に提供した情報、ユーザーの本サービスの利用状況、その他ユーザーに関する一切の情報のことをいいます。"
                  />
                </ListItem>
              </List>
            </ListItem>

            {/* Section 3 */}
            <ListItem sx={{ display: 'block', mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                第3条（禁止事項）
              </Typography>
              <Typography variant="body1" paragraph>
                ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="法令または公序良俗に違反する行為"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="当社または第三者のサーバーまたはネットワークの機能を破壊または妨害する行為"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="当社のサービスの運営を妨害するおそれのある行為"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="他のユーザーに迷惑をかける行為"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="その他、当社が不適切と判断する行為"
                  />
                </ListItem>
              </List>
            </ListItem>

            {/* Section 4 */}
            <ListItem sx={{ display: 'block', mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                第4条（本サービスの提供の停止等）
              </Typography>
              <Typography variant="body1" paragraph>
                当社は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく
                本サービスの全部または一部の提供を停止または中断することができるものとします。
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="本サービスにかかるコンピュータシステムの保守点検または更新を行う場合"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="その他、当社が本サービスの提供が困難と判断した場合"
                  />
                </ListItem>
              </List>
            </ListItem>

            {/* Section 5 */}
            <ListItem sx={{ display: 'block', mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                第5条（免責事項）
              </Typography>
              <Typography variant="body1" paragraph>
                当社は、本サービスに関して、ユーザーと他のユーザーまたは第三者との間において生じた取引、
                連絡または紛争等について一切責任を負いません。
              </Typography>
            </ListItem>

            {/* Section 6 */}
            <ListItem sx={{ display: 'block', mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                第6条（サービス内容の変更等）
              </Typography>
              <Typography variant="body1" paragraph>
                当社は、ユーザーに通知することなく、本サービスの内容を変更しまたは本サービスの提供を中止することができるものとし、
                これによってユーザーに生じた損害について一切の責任を負いません。
              </Typography>
            </ListItem>

            {/* Section 7 */}
            <ListItem sx={{ display: 'block', mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                第7条（利用規約の変更）
              </Typography>
              <Typography variant="body1" paragraph>
                当社は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。
                なお、本規約の変更の際は、変更後の規約の内容を本サービス上に掲載するものとします。
              </Typography>
            </ListItem>

            {/* Section 8 */}
            <ListItem sx={{ display: 'block', mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                第8条（通知または連絡）
              </Typography>
              <Typography variant="body1" paragraph>
                ユーザーと当社との間の通知または連絡は、当社の定める方法によって行うものとします。
                当社は、ユーザーから、当社が定める方法に従った変更の届出がない限り、
                現在登録されている連絡先が有効なものとみなして当該連絡先へ通知または連絡を行い、
                これらは、発信時にユーザーへ到達したものとみなします。
              </Typography>
            </ListItem>

            {/* Section 9 */}
            <ListItem sx={{ display: 'block', mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                第9条（権利義務の譲渡の禁止）
              </Typography>
              <Typography variant="body1" paragraph>
                ユーザーは、当社の書面による事前の承諾なく、利用契約上の地位または本規約に基づく権利もしくは義務を
                第三者に譲渡し、または担保に供することはできません。
              </Typography>
            </ListItem>

            {/* Section 10 */}
            <ListItem sx={{ display: 'block' }}>
              <Typography variant="h6" gutterBottom>
                第10条（準拠法・裁判管轄）
              </Typography>
              <Typography variant="body1" paragraph>
                本規約の解釈にあたっては、日本法を準拠法とします。
                本サービスに関して紛争が生じた場合には、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
              </Typography>
            </ListItem>
          </List>

          <Divider sx={{ my: 4 }} />

          {/* Contact Information */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              お問い合わせ
            </Typography>
            <Typography variant="body1" color="text.secondary">
              本規約に関するお問い合わせは、下記の連絡先までお願いいたします。
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              Seller Navi カスタマーサポート
              <br />
              Email: support@sellernavi.com
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default TermsPage; 