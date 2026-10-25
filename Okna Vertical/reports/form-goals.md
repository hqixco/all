# Цели форм по страницам

Счётчик Яндекс.Метрики: 111323394. Тип цели: JavaScript-событие (целевое событие).

Общая цель lead_form_submit сохранена, дополнительно после успешного ответа mail.php вызывается одна цель страницы. Одинаково для попапов, квизов, калькуляторов и других форм общего обработчика. При ошибке сервера цели не вызываются. Старые городские цели и Top.Mail сохранены; цель балконов не дублируется.

| Страница | Идентификатор |
| --- | --- |
| / | `lead_form_submit_home` |
| /zhalyuzi/ | `lead_form_submit_zhalyuzi` |
| /okna-v-chastnyj-dom/ | `lead_form_submit_okna_v_chastnyj_dom` |
| /okna-na-dachu/ | `lead_form_submit_okna_na_dachu` |
| /osteklenie-verand-terras/ | `lead_form_submit_osteklenie_verand_terras` |
| /holodnoe-osteklenie-balkonov/ | `lead_form_submit_holodnoe_osteklenie_balkonov` |
| /teploe-osteklenie-balkonov/ | `lead_form_submit_teploe_osteklenie_balkonov` |
| /otdelka-balkonov/ | `lead_form_submit_otdelka_balkonov` |
| /balkonnye-bloki/ | `lead_form_submit_balkonnye_bloki` |
| /panoramnye-okna/ | `lead_form_submit_panoramnye_okna` |
| /laminirovannye-okna/ | `lead_form_submit_laminirovannye_okna` |
| /dveri-pvh/ | `lead_form_submit_dveri_pvh` |
| /moskitnye-setki/ | `lead_form_submit_moskitnye_setki` |
| /montazh-okon/ | `lead_form_submit_montazh_okon` |
| /balkony/ | `lead_form_submit_balkony` |
| /proverka-smety/ | `lead_form_submit_proverka_smety` |
| /raschet-stoimosti/ | `lead_form_submit_raschet_stoimosti` |
| /ceny/ | `lead_form_submit_ceny` |
| /rassrochka/ | `lead_form_submit_rassrochka` |
| /garantiya/ | `lead_form_submit_garantiya` |
| /portfolio/ | `lead_form_submit_portfolio` |
| /o-kompanii/ | `lead_form_submit_o_kompanii` |
| /kontakty/ | `lead_form_submit_kontakty` |
| /cookie/ | `lead_form_submit_cookie` |
| /politika-konfidentsialnosti/ | `lead_form_submit_politika_konfidentsialnosti` |
| /okna-v-kvartiru/ | `lead_form_submit_okna_v_kvartiru` |

Эти идентификаторы требуется создать в интерфейсе счётчика как отдельные цели, если они ещё не существуют. В рамках задачи добавлена отправка событий на сайте; настройки аккаунта Метрики не изменялись.

Проверено: production-сборка, check:components, check-form-goals.mjs. Браузерная проверка успешной отправки общей модальной формы на всех 26 страницах: уникальная цель страницы и общая цель вызываются по одному разу. Ошибка mail.php не вызывает конверсию. Реальные заявки и события в счётчик во время теста не отправлялись. Справочник API: https://yandex.ru/support/metrica/ru/objects/reachgoal
