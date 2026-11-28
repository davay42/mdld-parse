# SHA Map — mdld-parse history rewrite (2026-11-28)

Commit `4d94e7de159c4e08c686fc4edd6b3ee165aeeaf1` ('1.2.1 ready') was reworded to remove the
Devin attribution trailer. All 84 commits after `a330d904cdcdeaef2a2d612b85ad88e341836e30` were
re-created and re-signed. **Every tree is byte-identical** —
verified position-by-position and at HEAD.

This map resolves any pre-rewrite SHA (npm provenance `gitHead`,
SLSA attestations, old links) to its post-rewrite equivalent.

| # | old commit | new commit | tree | subject |
|---|-----------|-----------|------|---------|
| 1 | `6e61e3fe5064e80226c23f31712e31bf7fb9ad15` | `68c10a442b9ca8127d97dc73cf061b394c5dbf79` | `fe5c9da3839e` | damn bot |
| 2 | `09d004dec122c1efd943373e4efc852af624a35f` | `3f5be275028dc99498f2b415e73e382cde4f0b50` | `1ae8fce437d8` | feat: atlas demo |
| 3 | `78fff0d9d14a2db0654a319bb8f89500a064c560` | `abe1c316cade8586151ce0e47ecd0f357ba06fcd` | `1cd13790cc96` | agents |
| 4 | `101eee2f3b570aa12d465ad82f99b0352dadd7da` | `6c9ff0e6ca043ed63fb632801abc3a3a2b271d00` | `cec418cb528a` | feat: clean js |
| 5 | `444659b94fa333e68cfd7d09ee35638578154994` | `aa9c5b6e6032b8f089eb4b7d08fc6c0ae7a20b8e` | `43b9f17ec910` | feat: js experiments |
| 6 | `51da22b2f837f0e5c3dcbc33ac464bf4b79e0311` | `059f7261fe18a9ed246690feb2d41069998f3505` | `e5d9bdd999e7` | feat: elegant chat |
| 7 | `3e497acabc4330ab000248989dbaa9ad2a58e654` | `d513ccf14e3eb5cb05af10afabc9391aab40cf07` | `ddfde1d383cf` | mjs for self-contained modules |
| 8 | `d74590d0502166aab9c6b8542c590b57f0c4461a` | `787640979e59e1f134ed5f1279dbf24975e60ee9` | `cb1226702ff3` | feat: dense prose |
| 9 | `42b44871c1930834eaf4c7653e21a614682ec91f` | `ba6c2e817c8698da5f03e1ef030dcd3ae118ebfb` | `601b3bec3264` | feat: workbench loop |
| 10 | `7281faf78de6fe4ebff268ed8f126b8eb847a139` | `f5fc22377598e5d206f3bd9aebd3d917026f4f87` | `d56ca2d4efb1` | red |
| 11 | `3d36305a3aa5631b5146f9d55869d2a6876c4636` | `84c82ce741786758e64528de5987803ee92c33d8` | `bd551cf0fa04` | feat: evaluate |
| 12 | `18ad4d00b5bfe3667740152481381c8554f98459` | `84869f0ef8a3c6dd35c3819552d9c42561a34c74` | `4c42dc689660` | feat: recordTable |
| 13 | `8ee9548eb1f4ee8fdf4ca20c86a127cf4d0b9886` | `5cdceb975105a3832ab3caebbf8567584281b83b` | `d52b18fb041d` | feat: 1.2.6 ready |
| 14 | `ac747157413e1c63dd2bcc482b534a410403da1d` | `60f6b246dd6cb8094756df2b7bc134009c32442f` | `e62dc027cba3` | feat: clean-up regex |
| 15 | `04e232b6fdc4039230ec196791efdd1c902711f2` | `f90f4f2da6256ff4244fee57ffded0d9d9f62cb6` | `987def9489cc` | feat: canonical comparison |
| 16 | `d267899663df8fdeac1fb4b689e09a615cedbf6a` | `d3de6834e0f8314746ac68d9c81cda7616d49e7b` | `0ced6cff7bc4` | quads for meaning |
| 17 | `fa06dcc8dc9c1c42ae05a0c910ef5037f43d694e` | `594962f357c0f2c3fa30cc9b107dba3212fd721b` | `f69c341191c8` | feat: hardened canonicalization |
| 18 | `01f02fc2c25eed53daa32c5378b8b5e833fce8bc` | `55eab1336238db80b968b9885e5a80903cd9ac56` | `4a57d0263eff` | feat: 60 kB gzipped |
| 19 | `e6974faa061e4da2e5652b6ec8db62aac59a88ae` | `7e45bf84ad0ea438fb500dbe6a1a9c72f2c4b66c` | `95bc7acaa9bc` | feat: code clean-up |
| 20 | `e4c1527a40f1b06a7331c0ba160fb7b6f4357bc2` | `62292ef884f6fc264c756a8a169ca64820811cb4` | `77feeea3aad5` | agent |
| 21 | `a25f8166f52d028bd4a0b9c63884ea3b52457872` | `96153b75856a119c214ccf69a9aaa0e64b5e72e9` | `0e41a08a3a33` | feat: terms |
| 22 | `9acf604b79c45d49dfba4e4ba0ac4d2a13153f17` | `ed1375c551b96b12ab2974d73e5d5142b01f2750` | `2fd8241f1849` | useful tool |
| 23 | `08f548ad0ed5bc45ee7d0c8a857d94b3eeb0ffb2` | `badb813ac57a97ffbbad087f46932e9e12916719` | `fab4cec30cf7` | feat: chat example |
| 24 | `7d81922cbfdf2e56768d899f908aeb6272c1e5c5` | `07120a35da0cd70a17d61a6326090c171a1490fa` | `de7a45b56ee2` | feat: interface |
| 25 | `be903178df830825eb42dfd150fcaf8c8ee23963` | `5e7b3c80996d9798dcea01380aacb6c9f7cfdc99` | `718de2fbe291` | meaningful state |
| 26 | `63720c31d4a33f677585b561e83ada44c925841f` | `26180b076607adfee28f14ce906a37a71f3b9a06` | `bceb65f17261` | feat: signatures |
| 27 | `6f79fd228db4635c4ce423d30b8998c6954ce1ff` | `d37619ec8f744d2d7df21d3b1198faa45d2e557d` | `23d932162bec` | feat: statements |
| 28 | `6bd65c0eb79f89a068d492e881987fe01f159c67` | `d8b8cdf47924fd0efafb54f67f71d8c8f49e72c5` | `0ee8cbe06b50` | feat: ready for 1.2.5 |
| 29 | `4ec86098a1d55a5cb45e22dc7ae7a9ca8e6db922` | `57b278faf7b36c26cbc68796a45491ea2e127d9e` | `d7a547455812` | feat: top-level |
| 30 | `d21d47f7ef38d899ea694d360db182ac89580783` | `3cfa03ef08fd193587ef4b179abc949caadb22e1` | `686490b4c0ab` | chat |
| 31 | `3eccefca0b4bfaaede75df4b4bdb136506aafd7f` | `c10859d9e5b1aa60c0d55874060614f1d4d3eb9d` | `b3239fd9bb56` | feat: editor and better graph |
| 32 | `39e046e0dfd1fef7325db3d04dcc3042b8f3b133` | `a48c6ddab560903582e0efc0ac17dc11cc99a8ef` | `d5d4a8be7154` | feat: graph view is persisted |
| 33 | `311b84cb70c421b0d681b7557bccaf9e87d0078d` | `8d9695a54224f1d4e13d05829f0e39ad133d6450` | `7215e1148aca` | store positions |
| 34 | `dd2a2690f4369e925c70c924774a1dee07c72b09` | `3d5e2efde484176f6ff5f62c99d14db1d83677e0` | `37360b0df0ae` | smooth focus |
| 35 | `a62820052ef3c01819c052fe063b6471f0ccac3e` | `235676bfec386c1e5ce7707134e56930a62cc2fa` | `9784639bbf1e` | feat: focus |
| 36 | `531adf9b8f203db2538b3f50dc5d0336de798b7e` | `433aafb9f99d96349470915ca119cacbe2cefd18` | `d3d7327fabec` | fast demo |
| 37 | `2b7218f285f29383a72fa81b3518182d598b95cf` | `b2d0d8b8cf4e1bc2356c583b7c16f20022e9eca6` | `de5181f41141` | clean examples |
| 38 | `ab0358b5e650fd700aeeea5bce0412091f4d7e2f` | `0965172ba400c4d3e4b202e0404efc6976061337` | `408eb4cf54f5` | feat: epistemology |
| 39 | `5f491b6f47e94b7af92fde08e69c34f43e1d62c7` | `6c7e8f1f1527307f831578b8edd0ea312410b1dc` | `a114daa4ca55` | feat: clean-up |
| 40 | `0a42f4da42e9c0e0b2185e3b350d7a88e16d82ed` | `7035ce5ccad072f260a64b76669eaf47078857fb` | `3bc5fde6a37a` | better docs |
| 41 | `9e2de8ee91316b7d20a691ca2b6a1b55cf1a6f6b` | `456691a5d0379912562d7dda7a08af9572a61229` | `70c16a6dbeab` | graph merged into unified bundle |
| 42 | `9bf0c2c8bf31355c4ad5bec2f18bfb6f64c056ac` | `1a774bbc3f033d47e2f67ef36288abfede7681d9` | `da0d679f56a4` | v1.2.3 |
| 43 | `61ee80c13037995325de52cd29e966466d72a54a` | `4b10bd483ade86a35d10c447965c49cd0ff4c885` | `d7eadae8801e` | feat: memo |
| 44 | `acebe0de46662780233a4b084c19f8ada63fc329` | `f33507d173e81cdb3d83bed762c0211f1f2bd3eb` | `fc93f420230b` | feat: performance |
| 45 | `ba9954a4c5bf52d4be87d677e9f5724f66132563` | `ce420dce6183a2d81041e776139784ed6d995eac` | `1975bf2048cd` | perf |
| 46 | `e11252f476cdc375780994623690ab4a11f74808` | `628353297b77a21ea398908870d03ea26980f7d3` | `51e39cc7b070` | feat: evaluate |
| 47 | `d4254fdb660c9e4c454300e9cd70f8a43b03e99b` | `94bcca65f6322c14c50fd9cc9e51e4754002f15a` | `57be49a3630e` | feat: ontology shapes |
| 48 | `139ec9c4dae9bd692d79189c2d31826aa7e83059` | `cc47a420f2baa6fcc61122aea53bb4aee6345859` | `a75d918ca215` | feat: xsd produc |
| 49 | `f4f0b695c5d2b2ea28cd3b451d8eb1342f5e7a48` | `b2bddd8cbaba4211759d3d1235c102fa6ea12fba` | `26714c166003` | feat: graphs hidden until not |
| 50 | `8dbc0eb9d86103aefdc66fe8c12e3b5f53a1580d` | `0780edbb48320ee4f415bf85c191d0881b2ce02e` | `5feaa08f85ff` | feat: inverses |
| 51 | `6bcc232e27e3f966ff78ad6dec849f9439425b0e` | `b26ec84f0694f303892bb89d93f10ad421f0a2ac` | `d23c85ff01ab` | feat: pancakes |
| 52 | `9f45870216d994c2703be0cc05b1943822f2f341` | `b45fb0a65a58574533660b971e6d994c4bd34c70` | `ce2eec88d6a3` | confidence gate |
| 53 | `ff2596534a9ef1e130ed95be516176f3e1ade68d` | `26c2c0e34dd8a99a31465001995798fd4abfe2cf` | `0e58c9bb970b` | res |
| 54 | `00e7409797f7efc0900f739599860ecf141f47a1` | `f8fd619b6e104bbeca476eef902b90af4121f0d3` | `3cf40c1f47b0` | feat: magic research |
| 55 | `62e7f80e20877a8dc16ca230facd29421db2b5eb` | `0d2271e1e0d015800bdad5791b78e621b0d60557` | `003e7c04d1f7` | feat: j |
| 56 | `ddaf71ff109ff77b0535c23db519e3b0240fcb5a` | `c7af72ccdb2aeb946ad2ebd30f57ebf8aca24c84` | `852389e3efd7` | feat: awesome journal |
| 57 | `7f24214f8a214e90caae5a6ddc1e67cc48216793` | `813a28766be5a595ae0e5aa96f96150b7feccaa8` | `e5842b6bc1c0` | feat: polished |
| 58 | `5587e3f26765442813235d7e3a50337f732682c7` | `d44d6774044ad907cf2257a431410bef2f67f37c` | `e7d5091294a0` | feat: shaped journal |
| 59 | `df5726675e88ce7fe3be134b8f7b5e9803a2d468` | `8c8e7ba0458d4d030c17a551c11c211a596cc539` | `fd1def2ebe96` | 1.2.2 |
| 60 | `52f021a03ecdbfe6ca8e45f79fcb0eca39cc576d` | `505457075fb4b7e2095f0fe10f32b873baa7fd27` | `3e686d113482` | changes documented |
| 61 | `6fa7aa92b8bc2a6fb0cb295eb38d823976b8db13` | `e957667b87796b8ceba1d0ff6027d76a7751cbf9` | `160f6538062a` | fix pojo |
| 62 | `95ab25326dc2b030c64437251669b76c96c24416` | `5494107bceada7712e687878128840e940b4759d` | `ee2ddccb3bf4` | 1.2.2 ready |
| 63 | `9cc14e420534151691b89089409bb79731f77bba` | `23cfd2a8575ce82fc8d11c884f46dd81a486e306` | `ba886ddbc505` | feat: merged API |
| 64 | `56c4bc1fbdfe5f803789e781b861d726ddd49e8f` | `69878d0b37b90fe70c7b762660c70044c1715196` | `877ab915826b` | feat: fast |
| 65 | `50d997e8272876defb470cbacd067589d5682be3` | `002273a5f9d6cb6679b64bec4d5307a4cdced771` | `8e3ac473746e` | feat: complete determinism achieved |
| 66 | `de6bfeb108fe9a9de13c97542553ae534d97c27c` | `5d1b14c39b5667c068115c406832c84adc6eea18` | `03a5b2fd05dd` | expecting messages |
| 67 | `c307edba3236bf0dea1e9b7ac02519eb1e41051b` | `fefb25f291f865a9ef2dba7ebc425577ced120b3` | `0057118c0e42` | feat: sub-classes |
| 68 | `665631e34d9ce02be72835297b5edb6ed7ceedee` | `5393b2e27357fefdb9e66cb8bdce30afcd99afd8` | `57040f164d83` | meta-modeling |
| 69 | `11b7d60c40f867567438dc2018905c091aecfd6a` | `a7092f6677eeb9a6ae94d3c2f6e823bf7e71f0f2` | `cc4ec7a639ca` | feat: pojos |
| 70 | `0dd9aebd5168f488896f19b507fb22fcc2ae1269` | `a8e8fd23d8c7735b43f5b9d9a5e6e15880425693` | `528983221018` | feat: beautiful example |
| 71 | `6adbbe1ec04df4994eda9fa2a563d88d85fb7ec7` | `b4612289036b57b6171f07b62cd84b2fc0c73ba8` | `f2ab9ec0ff42` | feat: first educational example wired up |
| 72 | `456e4628f77a74b50552546dc77fe546bf2012d7` | `d83b28f4909585fabc7576f3cfabb548724c62fb` | `9f8539f62275` | feat: compact messages |
| 73 | `571ba4747093ea45854b9bbb73a1232d9dcee895` | `207627eb8445c805af6e734205e21ad960ffcb23` | `16df777ef961` | fix: examples |
| 74 | `b61dafcec332a724c9063fc33898846a0ca242b7` | `69630edfd282cb5c691f8c1300e7da704af211c9` | `9b7a945eebf1` | no process |
| 75 | `ad6001450c0f0d2c3e59ac02adaebeca35c9d9e9` | `f96a5478cac8fe0c9665abbb6f44b51f529e6321` | `46a98cb73dca` | feat: process |
| 76 | `0527db35dffc325a1ec0af9815073d272f118a63` | `802c56b1f6a27cb3881a640bbd3d18beb56f5a50` | `05c3de231f36` | feat: demo |
| 77 | `18bbfe4984cd72d1f9c54a5dbbb7ee66a7275f5c` | `cbafd8921f3e9199ed54222c92a1ba97e6ced468` | `20635145bda0` | extract |
| 78 | `80d06dc0d845bc5c4b68b1c0c13901c79bc556fc` | `e6df13a4d9564603bd71c88aa4bb0c9ea3b469b4` | `b374419bede1` | feat: end-to-end |
| 79 | `5de1debf97cab2b817d8ed3010b3d54900c57526` | `19d2b20df7f1a43b18edf2fdd091bb7dc3576874` | `0e48a8b7bcd9` | loops |
| 80 | `a815f993f3b01d8239852ff0aac0634766ae80df` | `2cdc1528db4dcd6da09d5a0f93062070a7fb5834` | `ec21c7327370` | feat: docs |
| 81 | `da59dc7b2fa839dd71ba5c8bdec1ea72de0c2191` | `8bede1753de65da98148b1250321fd3b162a64ec` | `3c99d1a7130e` | feat: perf |
| 82 | `501104b22a989c4069fe478ac2d0d93cf703fc53` | `2e755e5db7ea7eb734a7b6b24abea8e8f5924f1a` | `cf418f153606` | feat: speed |
| 83 | `8a762cadc3b316507bd6d77233e4a1d5db290046` | `0354e1817c4231460c5f7f1d8c73b6f062bf11b0` | `50a699a17743` | feat: extraction is clean |
| 84 | `4d94e7de159c4e08c686fc4edd6b3ee165aeeaf1` | `cf0742e727f0632c71aa697cd2225caa625f9036` | `152b0cee27ab` | 1.2.1 ready |
