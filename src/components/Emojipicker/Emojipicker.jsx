import EmojiPicker from 'emoji-picker-react';
import React from 'react'
import { supabase } from '../../supabase';

export default function Emojipicker() {

    async function handleReaction(reactionData, event) {
        console.log(event);
        // const { data, error } = await supabase.select('*').from('reactions')
        console.log(reactionData.unified);
    }

    return (
        <EmojiPicker
            allowExpandReactions={false}
            reactionsDefaultOpen={true}
            onReactionClick={handleReaction}
            lazyLoadEmojis={true}
        />
    )
}
