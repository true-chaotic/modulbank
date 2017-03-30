/*global
 $, Typograf, document, location
 */
/**
 * Загрузка и отображение модели на странице с помощью JSRender
 *
 * Требует jquery, jsrender, Typograf (https://typograf.github.io/)
 */
$(function () {
    "use strict";

    var tp = new Typograf({locale: ['ru', 'en-US']}),
        // Заданы отдельной переменной для удобного тестирования вне шаблонов
        helpers = {
            /**
             * Проверяет на истинность. В модели Boolean-значения
             * приходят строками, иногда с первой строчной
             *
             * @param {*} value - исходное значение
             * @returns {boolean}
             */
            isTrue: function (value) {
                if (typeof value === "boolean") {
                    return value;
                }

                return String(value).toLowerCase() === 'true';
            },

            /**
             * Возврашает объект с ключами без @ в начале,
             *
             * @param {Object} source
             * @returns {Object}
             */
            cleanObject: function (source) {
                var key,
                    result = {};

                for (key in source) {
                    if (source.hasOwnProperty(key)) {
                        result[key.replace(/^@/, '')] = source[key];
                    }
                }

                return result;
            },

            /**
             * Возврашает массиы объектов с ключами без @ в начале,
             *
             * @param {Object} arr
             * @returns {Object}
             */
            cleanArray: function (arr) {
                var i, l,
                    result = [];

                for (i = 0, l = arr.length; i < l; i += 1) {
                    result.push(helpers.cleanObject(arr[i]));
                }

                return result;
            },

            /**
             * Чистит ключи объектов от @
             * Возврашает объект с ключами без @ в начале,
             * с исходными ключами неудобно работать
             *
             * @param {Object} obj
             * @returns {Object}
             */
            clean: function (obj) {
                if ($.isArray(obj)) {
                    return helpers.cleanArray(obj);
                }

                return helpers.cleanObject(obj);
            },

            /**
             * Типографические правки
             *
             * @param {string} text
             */
            typo: function (text) {
                return tp.execute(text);
            },

            /**
             * Бъёт номер для показа
             * @param phone
             */
            splitPhone: function (phone) {
                return [phone.substr(0, 3), phone.substr(3, 2), phone.substr(5, 2)].join(' ');
            }
        };

    // Для доступа к функциям в шаблонах: напр. ~splitPhone
    $.views.helpers(helpers);

    /**
     * Добавляет отрисованный шаблон на страницу
     *
     * @param {Object} model - модель, полученная с сервера
     */
    function render(model) {
        $('.js-content').html($.templates("#init").render(model));

        document.title = $('.js-title').text();
    }

    $(document).on("click", '.js-refresh', function () {
        // Обновление страницы с шаблона ошибки. С JsViews можно было бы использовать {^{on ...

        location.reload();
    }).on("click", '.js-phones__toggle', function () {
        // Сворачивание и разворачивание блока телефонов

        var t = $(this),
            module = t.parents('.js-phones');

        module.find('.js-phones__phone_inactive, .js-phones__toggleShow, .js-phones__toggleHide, .js-phones__phone_label')
            .toggleClass('hide');
    });

    $.getJSON('data' + (Math.random() * 10 < 8 ? '' : 'WillNotLoad') + '.json')
        .done(function (data) {
            render(data);
        })
        .fail(function (e) {
            console.error(e.statusText);

            render({
                "ResultInfo": {
                    "@ResultType": "False",
                    "@ErrorText": "Данные недоступны"
                }
            });
        });
});