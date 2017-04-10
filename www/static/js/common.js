/**
 * Created by liwei on 2016/12/22.
 */
$(function () {
    //发布
    $(document).on('click', '#issue', function () {
        var buttons1 = [
            {
                text: '作品',
                onClick: function () {
                    window.location.href="./work/introduce";
                }
            },
            {
                text: '文章',
                onClick: function () {
                    window.location.href="./article/introduce";
                }
            },
            {
                text: '心情',
                onClick: function () {
                    window.location.href="./mood/introduce";
                }
            }
        ];
        var buttons2 = [
            {
                text: '取消',
                bg: 'danger'
            }
        ];
        var groups = [buttons1, buttons2];
        $.actions(groups);
    });

    $(function () {
        $(document).on('click', '.alert-text', function () {
            $.alert('暂未开放此功能');
        });
    });
});
