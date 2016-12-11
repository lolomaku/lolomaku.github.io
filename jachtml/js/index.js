var $words = $('.rotate ul li'),
    $word = $('.rotate ul'),
    mainTl = new TimelineMax({
      repeat: -1,
      repeatDelay: 0
    });

$words.each(function(index, element){
  var word = $(this),
      wordNum = index+1,
      wordTl = new TimelineMax({
        delay: 1
      });

  wordTl.to($word, .25, {
      marginTop: '-' + wordNum*2 + 'em'
  });
  
  mainTl.add(wordTl);
   
  word.clone().appendTo($word);
  console.log(word);
});
