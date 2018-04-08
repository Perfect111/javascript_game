jQuery.noConflict();
jQuery(function(){
	// スクロールバーの横幅を取得
	jQuery('html').append('<div class="scrollbar" style="overflow:scroll;"></div>');
	var scrollsize = window.innerWidth - jQuery('.scrollbar').prop('clientWidth');
	jQuery('.scrollbar').hide();
	
	//「.quiz-modal-open」をクリック
	jQuery('.quiz-modal-open').click(function(){
		// html、bodyを固定（overflow:hiddenにする）※追加
		jQuery('html, body').addClass('lock');
		// オーバーレイ用の要素を追加
		jQuery('body').append('<div class="quiz-modal-overlay"></div>');
		// オーバーレイをフェードイン
		jQuery('.quiz-modal-overlay').fadeIn('slow');

		// モーダルコンテンツのIDを取得
		var modal = '#quizgamemodal';
		
		 // モーダルコンテンツを囲む要素を追加※追加
		jQuery(modal).wrap("<div class='modal-wrap'></div>");
		// モーダルコンテンツを囲む要素を表示※追加
		jQuery('.modal-wrap').show();
		
		// モーダルコンテンツの表示位置を設定
		modalResize();
		// モーダルコンテンツフェードイン
		jQuery(modal).fadeIn('slow');

		// モーダルコンテンツをクリックした時はフェードアウトしない
		jQuery(modal).click(function(e){
			e.stopPropagation();
		});

		// 「.quiz-modal-overlay」あるいは「.quiz-modal-close」をクリック
		jQuery('.quiz-modal-overlay, .quiz-modal-close, .modal-wrap').off().click(function(){
			// モーダルコンテンツとオーバーレイをフェードアウト
			jQuery(modal).fadeOut('slow');
			jQuery('.quiz-modal-overlay').fadeOut('slow',function(){
				// html、bodyの固定解除
				jQuery('html, body').removeClass('lock');
				// オーバーレイを削除
				jQuery('.quiz-modal-overlay').remove();
				// モーダルコンテンツを囲む要素を削除
				jQuery(modal).unwrap("<div class='modal-wrap'></div>");
			});
			window.location.reload() ;
		});

		// リサイズしたら表示位置を再取得
		var current_scrollY;
		jQuery(window).on('resize', function(){
			modalResize();
			jQuery( '#quizframe' ).css( {
				position: 'fixed',
				width: '100%',
				top: -1 * current_scrollY
			} );
		});

		// モーダルコンテンツの表示位置を設定する関数
		function modalResize(){
			// ウィンドウの横幅、高さを取得
			var w = jQuery(window).width();
			var h = jQuery(window).height();

			// モーダルコンテンツの横幅、高さを取得
			var mw = jQuery(modal).outerWidth(true);
			var mh = jQuery(modal).outerHeight(true);

			// モーダルコンテンツの表示位置を取得
			var x = (w - jQuery(modal).outerWidth(true)) / 2;
			var y = (h - jQuery(modal).outerHeight(true)) / 2;

			// モーダルコンテンツの表示位置を設定
			if ((mh > h) && (mw > w)) {
				jQuery(modal).css({'left': 0 + 'px','top': 0 + 'px'});
			} else if ((mh > h) && (mw < w)) {
				var x = (w - scrollsize - mw) / 2;
				jQuery(modal).css({'left': x + 'px','top': 0 + 'px'});
			} else if ((mh < h) && (mw > w)) {
				var y = (h - scrollsize - mh) / 2;
				jQuery(modal).css({'left': 0 + 'px','top': y + 'px'});
			} else {
				var x = (w - mw) / 2;
				var y = (h - mh) / 2;
				jQuery(modal).css({'left': x + 'px','top': y + 'px'});
			}
		}
	});
})