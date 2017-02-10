/**
* Shuffle the elements in an array
* @param array $input An array to be randomized
* @return array The randomized array
*/

<?php

	$input = array(1, 2, 3, 4, 5);

	function my_shuffle($input) {
		$count = count($input);

		while(--$i){
		  $rand = mt_rand(0,$count);
		    if($count != $rand){
		      $tmp = $input[$rand];
		      $input[$rand] = $input[$count];
		      $input[$count] = $tmp;
		    }
		  }
		return $input;
	}

	echo my_shuffle();

?>

