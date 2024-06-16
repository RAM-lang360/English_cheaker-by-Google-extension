# English Cheacker by google extension
## 概要
このアプリケーションは英文、スペルの正誤や似ている英単語の説明などをGoogle が提供するGeminiAIを用いたGoogle拡張機能である。
## 開発環境
- OS Microsoft Windows 10 Home
- Javascript
- Google chrome
## 設計
- manifest.json
  - google extensionのconfig設定
- popup.js
  - 入力された情報をbackground.jsに送る。またbackground.jsからの結果を受ける
- background.js
  - fetchを使いGeminiREST-APIにHttpリクエストする。実際に使う場合はここのIndividually Gemini APIのフィードに個人のAPIKEYを入力する
- order1,2,3.json/html/js
  - 設定したモードに合わせたサイトデータ

## 使用方法
### English checkerのインストール方法
1. chromeからgoogle拡張機能を選択
2. 拡張機能の管理を選択
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. インストールしたフォルダを選択
### English checkerの使用方法
1. English checkerのアイコンをクリック
2. popupから使用したい機能を選択し、フィードに質問内容を入力
   - 英文チェックの場合は英文をそのまま入力
   - 似ていている英単語の説明の場合は2単語の間にスペースを入れて入力
   - スペルの正誤の場合は単語をそのまま入力

##　注意
無料APIを使っているため答えが正確でない場合がある。

## 感想
このアプリケーションは製作者が英語を勉強する際いちいちChat-GPTなどのサイトで質問を入力するのがめんどくさく感じたため制作したものである。  

googleextensionは非常にセキュリティが厳しいため、popupからfetchをすることができない。fetchをする際はbackgroundという独立した空間から行う必要があるため、fetchしたい情報の伝達が複雑だった。またAPI-background間、background-popup間での情報の取得に多少の時間がかかるためasync wait による非同期処理の明示が必要だった。(この時間差によるエラーに長く苦しめられた)  

GenimiAIのレスポンスの整形が非常に複雑だった。リクエストに質問を乗せ返答を待つお粗末なつくりのため、AIの返信が一定の型でないことが理由として考えられる。次回AIのAPIを使う際はもう少し丁寧に使用したい。

このアプリケーションでは主にhtml,css,jsを使用している。これらの言語はwebサイトのフロントエンドに使用されるものであり、web開発に関して非常に勉強になった。