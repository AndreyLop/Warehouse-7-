<?php
if( isset($_POST['jsonUserData']) )
{
     $fromPerson = '+from%3A'.$_POST['jsonUserData'];
     echo $fromPerson;
}
?>
