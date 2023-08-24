function checkIt(status) {
    $("i.sim-tree-checkbox").each(function () {
        var $check = $(this);
        var $li = $check.closest('li');
        var $childUl, $childUlCheck;
        var data = $li.data();
        if (typeof status === 'undefined') {
            status = !data.checked;
        }

        if (status === true) {
            $('#flexCheckDefault').prop('checked', true);
            $check.removeClass('sim-tree-semi').addClass('checked');
        } else if (status === false) {
            $('#flexCheckDefault').prop('checked', false);
            $check.removeClass('checked sim-tree-semi');
        } else if (status === 'semi') {
            $check.removeClass('checked').addClass('sim-tree-semi');
        }
        $li.data('checked', status);
    });
}

function setParentCheck(e) {
    var t,
        i = e.parent("ul"),
        s = i.parent("li"),
        n = i.children("li"),
        a = s.find(">a .sim-tree-checkbox"),
        r = [],
        d = n.length;
    s.length &&
        (e.find(">a .sim-tree-checkbox").hasClass("sim-tree-semi")
            ? doCheck(a, "semi")
            : ($.each(n, function () {
                !0 === $(this).data("checked") && r.push($(this));
            }),
                (t = r.length),
                d === t && doCheck(a, !0),
                t || doCheck(a, !1),
                t >= 1 && t < d && doCheck(a, "semi")));
}

function doCheck(e, t, i) {
    var s = e.closest("li"),
        n = s.data();
    void 0 === t && (t = !n.checked),
        !0 === t ? e.removeClass("sim-tree-semi").addClass("checked") : !1 === t ? e.removeClass("checked sim-tree-semi") : "semi" === t && e.removeClass("checked").addClass("sim-tree-semi"),
        s.data("checked", t),
        !0 ===/*  this.options.linkParent && */ !i && setParentCheck(s);
}

function checkGiven($li, status) {
    var data = $li.data();
    if (typeof status === 'undefined') {
        status = !data.checked;
    }

    var $a = $li.children('a');
    var $check = $a.children('.sim-tree-checkbox');
    if (status === true) {
        $check.removeClass('sim-tree-semi').addClass('checked');
    } else if (status === false) {
        $check.removeClass('checked sim-tree-semi');
    } else if (status === 'semi') {
        $check.removeClass('checked').addClass('sim-tree-semi');
    }
    $li.data('checked', status);
    setParentCheck($li);
}